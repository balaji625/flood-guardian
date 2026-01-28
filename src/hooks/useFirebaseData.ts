import { useState, useEffect, useCallback } from 'react';
import { ref, push, set, onValue, query, orderByChild, limitToLast, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { SOSRequest, CrowdReport } from '@/types/flood';
import { useAreaRouting } from './useAreaRouting';

export function useSOSRequests() {
  const [sosRequests, setSOSRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { routeSOSRequest } = useAreaRouting();

  useEffect(() => {
    const sosRef = query(ref(database, 'sosRequests'), orderByChild('timestamp'), limitToLast(100));
    
    const unsubscribe = onValue(sosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requests: SOSRequest[] = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        })).sort((a, b) => b.timestamp - a.timestamp);
        setSOSRequests(requests);
      } else {
        setSOSRequests([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching SOS requests:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createSOSRequest = useCallback(async (request: Omit<SOSRequest, 'id' | 'timestamp' | 'status'>) => {
    try {
      const sosRef = ref(database, 'sosRequests');
      const newRef = push(sosRef);
      
      const fullRequest: Omit<SOSRequest, 'id'> = {
        ...request,
        timestamp: Date.now(),
        status: 'pending',
      };

      await set(newRef, fullRequest);

      // Auto-route to nearest authorities
      const sosWithId = { ...fullRequest, id: newRef.key! } as SOSRequest;
      try {
        await routeSOSRequest(sosWithId);
      } catch (routeErr) {
        console.error('Error routing SOS request:', routeErr);
        // Don't fail the SOS creation if routing fails
      }

      return newRef.key;
    } catch (err: any) {
      console.error('Error creating SOS request:', err);
      throw err;
    }
  }, [routeSOSRequest]);

  const updateSOSStatus = useCallback(async (sosId: string, status: SOSRequest['status'], assignedTo?: string) => {
    try {
      const updates: Record<string, any> = { status };
      if (assignedTo) {
        if (status === 'acknowledged') {
          updates.acknowledgedBy = assignedTo;
          updates.acknowledgedAt = Date.now();
        } else if (status === 'dispatched') {
          updates.dispatchedBy = assignedTo;
          updates.dispatchedAt = Date.now();
        }
        updates.assignedTo = assignedTo;
      }
      if (status === 'resolved') {
        updates.resolvedAt = Date.now();
      }
      updates.updatedAt = Date.now();
      
      await update(ref(database, `sosRequests/${sosId}`), updates);
    } catch (err: any) {
      console.error('Error updating SOS status:', err);
      throw err;
    }
  }, []);

  return {
    sosRequests,
    loading,
    error,
    createSOSRequest,
    updateSOSStatus,
  };
}

export function useCrowdReports() {
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reportsRef = query(ref(database, 'crowdReports'), orderByChild('timestamp'), limitToLast(100));
    
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsList: CrowdReport[] = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        })).sort((a, b) => b.timestamp - a.timestamp);
        setReports(reportsList);
      } else {
        setReports([]);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching crowd reports:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createReport = useCallback(async (report: Omit<CrowdReport, 'id' | 'timestamp' | 'verified'>) => {
    try {
      const reportsRef = ref(database, 'crowdReports');
      const newRef = push(reportsRef);
      
      await set(newRef, {
        ...report,
        timestamp: Date.now(),
        verified: false,
      });

      return newRef.key;
    } catch (err: any) {
      console.error('Error creating crowd report:', err);
      throw err;
    }
  }, []);

  const verifyReport = useCallback(async (reportId: string, verified: boolean) => {
    try {
      await update(ref(database, `crowdReports/${reportId}`), {
        verified,
        verifiedAt: Date.now(),
      });
    } catch (err: any) {
      console.error('Error verifying report:', err);
      throw err;
    }
  }, []);

  return {
    reports,
    loading,
    error,
    createReport,
    verifyReport,
  };
}
