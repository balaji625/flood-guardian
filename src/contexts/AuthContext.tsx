import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { AuthUser, UserRole } from '@/types/flood';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing - Government authority roles
const DEMO_USERS: Record<string, AuthUser> = {
  'admin@flood.gov': { uid: 'admin1', email: 'admin@flood.gov', role: 'admin', name: 'System Admin', department: 'IT Administration' },
  'authority@flood.gov': { uid: 'auth1', email: 'authority@flood.gov', role: 'authority', name: 'District Collector', department: 'Disaster Management Cell' },
  'police@flood.gov': { uid: 'police1', email: 'police@flood.gov', role: 'police', name: 'Inspector Kumar', department: 'Emergency Response Unit' },
  'hospital@flood.gov': { uid: 'hosp1', email: 'hospital@flood.gov', role: 'hospital', name: 'Dr. Sharma', department: 'Emergency Ward' },
  'ambulance@flood.gov': { uid: 'amb1', email: 'ambulance@flood.gov', role: 'ambulance', name: 'Control Room', department: 'Ambulance Services' },
  'fire@flood.gov': { uid: 'fire1', email: 'fire@flood.gov', role: 'fire', name: 'Fire Chief', department: 'Fire & Rescue Services' },
  'doctor@flood.gov': { uid: 'doc1', email: 'doctor@flood.gov', role: 'doctor', name: 'Dr. Patel', department: 'Emergency Medicine' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state listener ONCE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const userRef = ref(database, `users/${fbUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              role: userData.role,
              name: userData.name,
              department: userData.department,
              stationName: userData.stationName,
              stationAddress: userData.stationAddress,
              phone: userData.phone,
              location: userData.location,
              verified: userData.verified,
            });
          } else {
            const demoUser = DEMO_USERS[fbUser.email || ''];
            if (demoUser) {
              setUser({ ...demoUser, uid: fbUser.uid });
            }
          }
        } catch {
          const demoUser = DEMO_USERS[fbUser.email || ''];
          if (demoUser) {
            setUser({ ...demoUser, uid: fbUser.uid });
          }
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Optimized sign in - immediate response for demo users
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    
    // For demo users, immediately set user state without waiting for Firebase
    const demoUser = DEMO_USERS[email];
    if (demoUser && password === 'demo123') {
      setUser(demoUser);
      setFirebaseUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener will handle the rest
    } catch (err: any) {
      // Fallback for demo users if Firebase fails
      if (demoUser) {
        setUser(demoUser);
        setLoading(false);
        return;
      }
      setError(err.message || 'Failed to sign in');
      setLoading(false);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Still clear local state even if Firebase fails
    }
    setUser(null);
    setFirebaseUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
