import { useState, useEffect, useCallback } from 'react';
import { ref, query, orderByChild, equalTo, onValue, push, set, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { 
  AuthorityRegistration, 
  AuthorityType, 
  ServiceArea, 
  calculateDistanceKm,
  getAuthoritiesForEmergency 
} from '@/types/authority';
import { SOSRequest, CrowdReport } from '@/types/flood';

interface NearbyAuthority extends AuthorityRegistration {
  distance: number;
}

export function useAreaRouting() {
  const [authorities, setAuthorities] = useState<AuthorityRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all verified authorities
  useEffect(() => {
    const authoritiesRef = ref(database, 'users');
    
    const unsubscribe = onValue(authoritiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const authList: AuthorityRegistration[] = Object.entries(data)
          .filter(([_, value]: [string, any]) => value.verified !== false && value.role)
          .map(([uid, value]: [string, any]) => ({
            uid,
            email: value.email,
            name: value.name,
            authorityType: value.role as AuthorityType,
            department: value.department || '',
            stationName: value.stationName || '',
            stationAddress: value.stationAddress || '',
            phone: value.phone || '',
            location: value.location || { lat: 0, lng: 0 },
            serviceArea: value.serviceArea || {
              id: 'default',
              name: value.stationAddress || 'Unknown',
              district: 'Unknown',
              state: 'Unknown',
              center: value.location || { lat: 19.076, lng: 72.877 },
            },
            verified: value.verified || false,
            createdAt: value.createdAt || Date.now(),
            fcmToken: value.fcmToken,
          }));
        setAuthorities(authList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Find nearest authorities for a given location and emergency type
  const findNearestAuthorities = useCallback((
    lat: number,
    lng: number,
    emergencyType: string,
    limit: number = 5
  ): NearbyAuthority[] => {
    const relevantTypes = getAuthoritiesForEmergency(emergencyType);
    
    return authorities
      .filter(auth => relevantTypes.includes(auth.authorityType))
      .map(auth => ({
        ...auth,
        distance: calculateDistanceKm(lat, lng, auth.location.lat, auth.location.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }, [authorities]);

  // Auto-route SOS request to nearest authorities
  const routeSOSRequest = useCallback(async (sos: SOSRequest): Promise<string[]> => {
    const nearbyAuthorities = findNearestAuthorities(
      sos.location.lat,
      sos.location.lng,
      sos.emergencyType,
      10
    );

    if (nearbyAuthorities.length === 0) {
      console.warn('No authorities found for SOS routing');
      return [];
    }

    // Route to all nearby relevant authorities
    const assignedUids = nearbyAuthorities.map(a => a.uid);

    // Create routing record
    const routingRef = push(ref(database, 'requestRouting'));
    await set(routingRef, {
      requestId: sos.id,
      requestType: 'sos',
      assignedTo: assignedUids,
      emergencyType: sos.emergencyType,
      location: sos.location,
      priority: sos.priority,
      status: 'pending',
      createdAt: Date.now(),
    });

    // Update SOS with routing info
    await update(ref(database, `sosRequests/${sos.id}`), {
      routedTo: assignedUids,
      routedAt: Date.now(),
    });

    return assignedUids;
  }, [findNearestAuthorities]);

  // Route crowd report to relevant authorities
  const routeCrowdReport = useCallback(async (report: CrowdReport): Promise<string[]> => {
    // Find authorities who can verify reports in the area
    const nearbyAuthorities = authorities
      .filter(auth => ['authority', 'admin', 'police', 'fire'].includes(auth.authorityType))
      .map(auth => ({
        ...auth,
        distance: calculateDistanceKm(
          report.location.lat,
          report.location.lng,
          auth.location.lat,
          auth.location.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    const assignedUids = nearbyAuthorities.map(a => a.uid);

    // Create routing record
    const routingRef = push(ref(database, 'requestRouting'));
    await set(routingRef, {
      requestId: report.id,
      requestType: 'report',
      assignedTo: assignedUids,
      location: report.location,
      waterLevel: report.waterLevel,
      status: 'pending',
      createdAt: Date.now(),
    });

    return assignedUids;
  }, [authorities]);

  // Get requests routed to a specific authority
  const getRoutedRequests = useCallback((authorityUid: string) => {
    return new Promise<any[]>((resolve) => {
      const routingRef = ref(database, 'requestRouting');
      onValue(routingRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const requests = Object.entries(data)
            .filter(([_, value]: [string, any]) => 
              value.assignedTo?.includes(authorityUid)
            )
            .map(([id, value]: [string, any]) => ({ id, ...value }));
          resolve(requests);
        } else {
          resolve([]);
        }
      }, { onlyOnce: true });
    });
  }, []);

  return {
    authorities,
    loading,
    findNearestAuthorities,
    routeSOSRequest,
    routeCrowdReport,
    getRoutedRequests,
  };
}

// Hook to get requests for current authority
export function useAuthorityRequests(authorityUid: string, authorityType: AuthorityType) {
  const [sosRequests, setSOSRequests] = useState<SOSRequest[]>([]);
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorityUid) return;

    // Subscribe to SOS requests routed to this authority
    const sosRef = ref(database, 'sosRequests');
    const unsubscribeSOS = onValue(sosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requests: SOSRequest[] = Object.entries(data)
          .map(([id, value]: [string, any]) => ({ id, ...value }))
          .filter((sos: any) => {
            // Show if routed to this authority OR if no routing yet (legacy data)
            return sos.routedTo?.includes(authorityUid) || !sos.routedTo;
          })
          .sort((a, b) => b.timestamp - a.timestamp);
        setSOSRequests(requests);
      } else {
        setSOSRequests([]);
      }
      setLoading(false);
    });

    // Subscribe to crowd reports (for authorities that can verify)
    if (['admin', 'authority', 'police', 'fire', 'hospital'].includes(authorityType)) {
      const reportsRef = ref(database, 'crowdReports');
      const unsubscribeReports = onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const reportsList: CrowdReport[] = Object.entries(data)
            .map(([id, value]: [string, any]) => ({ id, ...value }))
            .sort((a, b) => b.timestamp - a.timestamp);
          setReports(reportsList);
        }
      });

      return () => {
        unsubscribeSOS();
        unsubscribeReports();
      };
    }

    return () => unsubscribeSOS();
  }, [authorityUid, authorityType]);

  return { sosRequests, reports, loading };
}
