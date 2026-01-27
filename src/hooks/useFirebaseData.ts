import { useState, useEffect, useCallback } from 'react';
import { ref, push, set, onValue, query, orderByChild, limitToLast, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { SOSRequest, CrowdReport } from '@/types/flood';

export function useSOSRequests() {
  const [sosRequests, setSOSRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sosRef = query(ref(database, 'sosRequests'), orderByChild('timestamp'), limitToLast(50));
    
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
      return newRef.key;
    } catch (err: any) {
      console.error('Error creating SOS request:', err);
      throw err;
    }
  }, []);

  const updateSOSStatus = useCallback(async (sosId: string, status: SOSRequest['status'], assignedTo?: string) => {
    try {
      const updates: Record<string, any> = { status };
      if (assignedTo) {
        updates.assignedTo = assignedTo;
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
    verifyReport,
  };
}
