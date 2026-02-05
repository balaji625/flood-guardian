import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface VoiceActivatedSOSProps {
  onSOSTrigger: () => void;
  enabled?: boolean;
}

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const TRIGGER_WORDS = ['help', 'emergency', 'sos', 'bachao', 'madad', 'sahayata'];

export const VoiceActivatedSOS: React.FC<VoiceActivatedSOSProps> = ({
  onSOSTrigger,
  enabled = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [lastHeard, setLastHeard] = useState<string>('');
  const [showIndicator, setShowIndicator] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<boolean>(false);

  const triggerSOS = useCallback(() => {
    if (cooldownRef.current) return;
    
    cooldownRef.current = true;
    
    // Visual and audio feedback
    toast.error('🚨 VOICE SOS ACTIVATED!', {
      description: 'Emergency services are being notified...',
      duration: 5000,
    });

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Play alert sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1100;
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 200);
      }, 200);
    } catch (e) {
      console.log('Audio not available');
    }

    onSOSTrigger();

    // Reset cooldown after 10 seconds
    setTimeout(() => {
      cooldownRef.current = false;
    }, 10000);
  }, [onSOSTrigger]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !enabled) return;

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started
    }
  }, [enabled]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setShowIndicator(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      
      for (let i = event.resultIndex; i < results.length; i++) {
        const transcript = results[i][0].transcript.toLowerCase().trim();
        setLastHeard(transcript);

        // Check for trigger words
        const triggered = TRIGGER_WORDS.some(word => transcript.includes(word));
        
        if (triggered) {
          triggerSOS();
          break;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed') {
        setIsSupported(false);
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access for voice SOS'
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Auto-restart if enabled
      if (enabled && recognitionRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    // Auto-start if enabled
    if (enabled) {
      startListening();
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      stopListening();
    };
  }, [enabled, startListening, stopListening, triggerSOS]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      setShowIndicator(false);
      toast.info('Voice SOS disabled');
    } else {
      startListening();
      toast.success('Voice SOS enabled', {
        description: 'Say "Help" or "Emergency" to trigger SOS'
      });
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Floating Voice Indicator */}
      <AnimatePresence>
        {showIndicator && isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-4 z-40"
          >
            <div className="glass-card rounded-full px-4 py-2 flex items-center gap-2 shadow-lg border border-primary/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 rounded-full bg-success"
              />
              <span className="text-xs font-medium text-muted-foreground">
                Voice SOS Active
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowIndicator(false)}
              >
                <MicOff className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Button in Header or Floating */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="icon"
        onClick={toggleListening}
        className={`relative ${isListening ? 'bg-success hover:bg-success/90' : ''}`}
        title={isListening ? 'Voice SOS Active - Click to disable' : 'Enable Voice SOS'}
      >
        {isListening ? (
          <>
            <Mic className="w-4 h-4" />
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-md bg-success"
            />
          </>
        ) : (
          <MicOff className="w-4 h-4" />
        )}
      </Button>
    </>
  );
};

export default VoiceActivatedSOS;
