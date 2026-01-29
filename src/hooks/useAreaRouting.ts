import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, set, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { 
  AuthorityRegistration, 
  AuthorityType, 
  calculateDistanceKm,
  getAuthoritiesForEmergency 
} from '@/types/authority';
import { SOSRequest, CrowdReport } from '@/types/flood';

interface NearbyAuthority extends AuthorityRegistration {
  distance: number;
}

// Map SOS emergency types to primary authority types
const EMERGENCY_AUTHORITY_MAP: Record<string, AuthorityType[]> = {
  'flood': ['authority', 'police', 'fire'],
  'trapped': ['fire', 'police', 'ambulance'],
  'medical': ['ambulance', 'hospital', 'doctor'],
  'fire': ['fire', 'police', 'ambulance'],
  'other': ['police', 'authority'],
};

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
    limit: number = 10
  ): NearbyAuthority[] => {
    // Get authority types that should handle this emergency
    const primaryTypes = EMERGENCY_AUTHORITY_MAP[emergencyType] || ['police', 'authority'];
    
    return authorities
      .filter(auth => primaryTypes.includes(auth.authorityType))
      .map(auth => ({
        ...auth,
        distance: calculateDistanceKm(lat, lng, auth.location.lat, auth.location.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }, [authorities]);

  // Smart routing: Route SOS request to ONLY the relevant authority type based on emergency
  const routeSOSRequest = useCallback(async (sos: SOSRequest): Promise<string[]> => {
    // Get the primary authority types for this emergency
    const primaryTypes = EMERGENCY_AUTHORITY_MAP[sos.emergencyType] || ['police'];
    
    // Find nearest authorities of each primary type
    const assignedUids: string[] = [];
    
    for (const authorityType of primaryTypes) {
      const nearbyOfType = authorities
        .filter(auth => auth.authorityType === authorityType)
        .map(auth => ({
          ...auth,
          distance: calculateDistanceKm(
            sos.location.lat, 
            sos.location.lng, 
            auth.location.lat, 
            auth.location.lng
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3); // Top 3 nearest of each type
      
      assignedUids.push(...nearbyOfType.map(a => a.uid));
    }

    if (assignedUids.length === 0) {
      console.warn('No authorities found for SOS routing, broadcasting to all');
      // Fallback: broadcast to all authorities
      assignedUids.push(...authorities.slice(0, 10).map(a => a.uid));
    }

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
  }, [authorities]);

  // Route crowd report to ALL authorities (as per requirement #5)
  const routeCrowdReport = useCallback(async (report: CrowdReport): Promise<string[]> => {
    // Broadcast to ALL authority types that can verify reports
    const verifyingTypes: AuthorityType[] = ['authority', 'admin', 'police', 'fire', 'hospital', 'ambulance'];
    
    const allRelevantAuthorities = authorities
      .filter(auth => verifyingTypes.includes(auth.authorityType))
      .map(auth => ({
        ...auth,
        distance: calculateDistanceKm(
          report.location.lat,
          report.location.lng,
          auth.location.lat,
          auth.location.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    const assignedUids = allRelevantAuthorities.map(a => a.uid);

    // Create routing record
    const routingRef = push(ref(database, 'requestRouting'));
    await set(routingRef, {
      requestId: report.id,
      requestType: 'report',
      assignedTo: assignedUids,
      location: report.location,
      waterLevel: report.waterLevel,
      status: 'pending',
      broadcastToAll: true,
      createdAt: Date.now(),
    });

    // Update report with routing info
    await update(ref(database, `crowdReports/${report.id}`), {
      routedTo: assignedUids,
      routedAt: Date.now(),
      broadcastToAll: true,
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

// Hook to get requests for current authority with smart filtering
export function useAuthorityRequests(authorityUid: string, authorityType: AuthorityType) {
  const [sosRequests, setSOSRequests] = useState<SOSRequest[]>([]);
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorityUid) return;

    // Subscribe to SOS requests
    const sosRef = ref(database, 'sosRequests');
    const unsubscribeSOS = onValue(sosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requests: SOSRequest[] = Object.entries(data)
          .map(([id, value]: [string, any]) => ({ id, ...value }))
          .filter((sos: any) => {
            // Smart filtering based on emergency type and authority type
            const primaryTypes = EMERGENCY_AUTHORITY_MAP[sos.emergencyType] || ['police'];
            
            // Show if:
            // 1. Explicitly routed to this authority
            // 2. This authority type handles this emergency type (for legacy/unrouted requests)
            // 3. Admin/authority can see everything
            return (
              sos.routedTo?.includes(authorityUid) ||
              (!sos.routedTo && primaryTypes.includes(authorityType)) ||
              authorityType === 'admin' ||
              authorityType === 'authority'
            );
          })
          .sort((a, b) => b.timestamp - a.timestamp);
        setSOSRequests(requests);
      } else {
        setSOSRequests([]);
      }
      setLoading(false);
    });

    // Subscribe to crowd reports - ALL authorities see reports (broadcast requirement)
    const reportsRef = ref(database, 'crowdReports');
    const unsubscribeReports = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsList: CrowdReport[] = Object.entries(data)
          .map(([id, value]: [string, any]) => ({ id, ...value }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setReports(reportsList);
      } else {
        setReports([]);
      }
    });

    return () => {
      unsubscribeSOS();
      unsubscribeReports();
    };
  }, [authorityUid, authorityType]);

  return { sosRequests, reports, loading };
}
