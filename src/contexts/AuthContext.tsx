import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Demo users for testing
const DEMO_USERS: Record<string, AuthUser> = {
  'admin@flood.gov': { uid: 'admin1', email: 'admin@flood.gov', role: 'admin', name: 'System Admin', department: 'IT' },
  'authority@flood.gov': { uid: 'auth1', email: 'authority@flood.gov', role: 'authority', name: 'District Collector', department: 'Disaster Management' },
  'police@flood.gov': { uid: 'police1', email: 'police@flood.gov', role: 'police', name: 'Inspector Kumar', department: 'Emergency Response' },
  'hospital@flood.gov': { uid: 'hosp1', email: 'hospital@flood.gov', role: 'hospital', name: 'Dr. Sharma', department: 'Emergency Ward' },
  'ambulance@flood.gov': { uid: 'amb1', email: 'ambulance@flood.gov', role: 'ambulance', name: 'Control Room', department: 'Ambulance Services' },
  'fire@flood.gov': { uid: 'fire1', email: 'fire@flood.gov', role: 'fire', name: 'Fire Chief', department: 'Fire & Rescue' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Try to get user role from database
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
            });
          } else {
            // Check demo users
            const demoUser = DEMO_USERS[fbUser.email || ''];
            if (demoUser) {
              setUser({ ...demoUser, uid: fbUser.uid });
            }
          }
        } catch {
          // Fallback to demo user
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
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      // For demo purposes, accept any password for demo users
      if (DEMO_USERS[email]) {
        // Simulate successful login for demo
        const demoUser = DEMO_USERS[email];
        setUser(demoUser);
        setFirebaseUser(null);
        setLoading(false);
        return;
      }
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // For demo, still allow login with demo credentials
      if (DEMO_USERS[email] && password === 'demo123') {
        const demoUser = DEMO_USERS[email];
        setUser(demoUser);
        setLoading(false);
        return;
      }
      setError(err.message || 'Failed to sign in');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      // Still clear local state
      setUser(null);
      setFirebaseUser(null);
    }
  };

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
