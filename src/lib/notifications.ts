import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { ref, update } from 'firebase/database';
import app, { database } from './firebase';

let messaging: Messaging | null = null;

// Initialize FCM - only works in browser with service worker support
export const initializeMessaging = async (): Promise<Messaging | null> => {
  try {
    if (typeof window === 'undefined') return null;
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers not supported');
      return null;
    }
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return null;
    }

    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  try {
    if (!messaging) {
      messaging = await initializeMessaging();
    }
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get the FCM token
      // Note: In production, you'd need to provide your VAPID key
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_HERE' // Replace with your actual VAPID key
      }).catch(() => null);
      
      if (token) {
        // Save token to user's profile in database
        await update(ref(database, `users/${userId}`), {
          fcmToken: token,
          fcmTokenUpdatedAt: Date.now(),
        });
        
        console.log('FCM Token saved for user:', userId);
        return token;
      }
    } else {
      console.log('Notification permission denied');
    }
    
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    initializeMessaging().then((msg) => {
      if (msg) {
        onMessage(msg, callback);
      }
    });
  } else {
    onMessage(messaging, callback);
  }
};

// Create notification payload for SOS
export const createSOSNotificationPayload = (
  sosType: string,
  location: string,
  priority: string
) => {
  return {
    notification: {
      title: `🚨 ${priority.toUpperCase()} SOS Alert`,
      body: `${sosType} emergency reported at ${location}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sos-alert',
      requireInteraction: true,
    },
    data: {
      type: 'sos',
      emergencyType: sosType,
      location,
      priority,
      timestamp: Date.now().toString(),
    },
  };
};

// Show local notification (for when app is in foreground)
export const showLocalNotification = (title: string, body: string, data?: any) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sos-alert',
      requireInteraction: true,
      data,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to dashboard
      window.location.href = '/dashboard';
    };

    // Auto-close after 30 seconds
    setTimeout(() => notification.close(), 30000);
  }
};

// Check if notifications are supported and enabled
export const checkNotificationSupport = (): {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
} => {
  if (!('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }
  return { supported: true, permission: Notification.permission };
};
