import { useState, useEffect, useCallback } from 'react';
import { 
  requestNotificationPermission, 
  onForegroundMessage, 
  showLocalNotification,
  checkNotificationSupport,
  initializeMessaging
} from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { SOSRequest } from '@/types/flood';

interface NotificationState {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  token: string | null;
  loading: boolean;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    supported: false,
    permission: 'unsupported',
    token: null,
    loading: true,
  });

  useEffect(() => {
    // Check notification support
    const { supported, permission } = checkNotificationSupport();
    setState(prev => ({ ...prev, supported, permission, loading: false }));
  }, []);

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    if (!user?.uid || !state.supported) return null;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const token = await requestNotificationPermission(user.uid);
      const { permission } = checkNotificationSupport();
      
      setState(prev => ({
        ...prev,
        token,
        permission,
        loading: false,
      }));
      
      return token;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({ ...prev, loading: false }));
      return null;
    }
  }, [user?.uid, state.supported]);

  // Subscribe to foreground messages
  useEffect(() => {
    if (!state.supported || state.permission !== 'granted') return;

    onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);
      
      // Show local notification
      if (payload.notification) {
        showLocalNotification(
          payload.notification.title || 'New Alert',
          payload.notification.body || 'You have a new notification',
          payload.data
        );
      }
    });
  }, [state.supported, state.permission]);

  // Notify about new SOS
  const notifyNewSOS = useCallback((sos: SOSRequest) => {
    if (state.permission !== 'granted') return;

    const title = `🚨 ${sos.priority.toUpperCase()} SOS Alert`;
    const body = `${sos.emergencyType} emergency reported${sos.location.address ? ` at ${sos.location.address}` : ''}`;
    
    showLocalNotification(title, body, {
      sosId: sos.id,
      emergencyType: sos.emergencyType,
      lat: sos.location.lat,
      lng: sos.location.lng,
    });
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    notifyNewSOS,
  };
}

// Hook to play alert sound
export function useAlertSound() {
  const playAlert = useCallback((type: 'sos' | 'notification' = 'notification') => {
    try {
      // Create audio context for alert sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'sos') {
        // Urgent siren pattern
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.4);
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.6);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
      } else {
        // Simple notification beep
        oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  }, []);

  return { playAlert };
}
