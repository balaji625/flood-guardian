import { useCallback } from 'react';

// Haptic feedback patterns for different alert types
// Pattern format: [vibrate, pause, vibrate, pause, ...] in milliseconds
export const HAPTIC_PATTERNS = {
  // Quick single tap - for button presses, selections
  tap: [10],
  
  // Double tap - for confirmations
  doubleTap: [10, 50, 10],
  
  // Success - short pleasant pattern
  success: [10, 30, 10, 30, 20],
  
  // Warning - medium attention-getting pattern
  warning: [50, 100, 50, 100, 50],
  
  // Error - strong pattern to indicate failure
  error: [100, 50, 100, 50, 100],
  
  // SOS Emergency - long urgent pattern
  sos: [200, 100, 200, 100, 200, 100, 300],
  
  // Countdown tick - single short pulse per second
  countdownTick: [50],
  
  // Alert notification - attention-getting
  notification: [100, 50, 100],
  
  // Gentle nudge - subtle reminder
  nudge: [20, 40, 20],
  
  // Critical alert - very urgent
  critical: [300, 100, 300, 100, 300, 100, 500],
  
  // Long press feedback
  longPress: [5, 10, 15, 20, 25],
  
  // Selection changed
  selection: [15],
  
  // Swipe gesture
  swipe: [10, 20, 10],
} as const;

export type HapticPattern = keyof typeof HAPTIC_PATTERNS;

interface UseHapticFeedbackOptions {
  enabled?: boolean;
}

export function useHapticFeedback(options: UseHapticFeedbackOptions = {}) {
  const { enabled = true } = options;

  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern: HapticPattern | number[]) => {
    if (!enabled || !isSupported) return false;

    try {
      const vibrationPattern = Array.isArray(pattern) 
        ? pattern 
        : HAPTIC_PATTERNS[pattern];
      
      return navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.log('Haptic feedback not available');
      return false;
    }
  }, [enabled, isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    navigator.vibrate(0);
  }, [isSupported]);

  // Pre-defined haptic actions
  const tap = useCallback(() => vibrate('tap'), [vibrate]);
  const doubleTap = useCallback(() => vibrate('doubleTap'), [vibrate]);
  const success = useCallback(() => vibrate('success'), [vibrate]);
  const warning = useCallback(() => vibrate('warning'), [vibrate]);
  const error = useCallback(() => vibrate('error'), [vibrate]);
  const sos = useCallback(() => vibrate('sos'), [vibrate]);
  const notification = useCallback(() => vibrate('notification'), [vibrate]);
  const countdownTick = useCallback(() => vibrate('countdownTick'), [vibrate]);
  const critical = useCallback(() => vibrate('critical'), [vibrate]);
  const nudge = useCallback(() => vibrate('nudge'), [vibrate]);
  const selection = useCallback(() => vibrate('selection'), [vibrate]);

  return {
    isSupported,
    vibrate,
    stop,
    // Named haptic actions
    tap,
    doubleTap,
    success,
    warning,
    error,
    sos,
    notification,
    countdownTick,
    critical,
    nudge,
    selection,
  };
}

// Standalone function for use outside React components
export function triggerHaptic(pattern: HapticPattern | number[]): boolean {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return false;
  }

  try {
    const vibrationPattern = Array.isArray(pattern) 
      ? pattern 
      : HAPTIC_PATTERNS[pattern];
    
    return navigator.vibrate(vibrationPattern);
  } catch (error) {
    return false;
  }
}

export default useHapticFeedback;
