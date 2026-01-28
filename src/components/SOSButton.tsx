import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users, 
  MessageSquare,
  X,
  Loader2,
  CheckCircle,
  Shield,
  Building2,
  Truck,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSOSRequests } from '@/hooks/useFirebaseData';
import { SOSRequest } from '@/types/flood';

interface SOSButtonProps {
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function SOSButton({ onClick, size = 'lg', className, disabled }: SOSButtonProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-24 h-24 text-lg',
    lg: 'w-32 h-32 text-xl',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-full font-bold text-white sos-button',
        'flex flex-col items-center justify-center gap-1',
        'focus:outline-none focus:ring-4 focus:ring-destructive/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-30" />
      <span className="absolute inset-2 rounded-full bg-destructive animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
      
      {/* Content */}
      <AlertTriangle className={cn(
        'relative z-10',
        size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10'
      )} />
      <span className="relative z-10 font-black tracking-widest">SOS</span>
    </motion.button>
  );
}

interface EmergencyCallButtonProps {
  label: string;
  number: string;
  icon?: React.ReactNode;
  variant?: 'police' | 'ambulance' | 'fire' | 'default';
  className?: string;
}

export function EmergencyCallButton({ 
  label, 
  number, 
  icon,
  variant = 'default',
  className 
}: EmergencyCallButtonProps) {
  const variantClasses = {
    police: 'bg-blue-600 hover:bg-blue-700',
    ambulance: 'bg-red-600 hover:bg-red-700',
    fire: 'bg-orange-600 hover:bg-orange-700',
    default: 'bg-primary hover:bg-primary/90',
  };

  const handleCall = () => {
    window.location.href = `tel:${number}`;
  };

  return (
    <motion.button
      onClick={handleCall}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium',
        'transition-colors duration-200',
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon || <Phone className="w-5 h-5" />}
      <div className="flex flex-col items-start">
        <span className="text-sm opacity-80">{label}</span>
        <span className="font-bold font-mono">{number}</span>
      </div>
    </motion.button>
  );
}

// Enhanced SOS Modal with full form
interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emergencyTypes = [
  { id: 'flood', label: 'Flood / Water Logging', icon: '🌊' },
  { id: 'trapped', label: 'Trapped / Stranded', icon: '🆘' },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥' },
  { id: 'fire', label: 'Fire Emergency', icon: '🔥' },
  { id: 'other', label: 'Other Emergency', icon: '⚠️' },
];

export function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const { createSOSRequest } = useSOSRequests();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    emergencyType: '' as SOSRequest['emergencyType'],
    description: '',
    lat: 0,
    lng: 0,
    address: '',
    contactNumber: '',
    peopleCount: 1,
    priority: 'high' as SOSRequest['priority'],
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          updateForm('lat', position.coords.latitude);
          updateForm('lng', position.coords.longitude);
          
          // Try reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              updateForm('address', data.display_name.split(',').slice(0, 3).join(','));
            }
          } catch (e) {
            console.error('Geocoding error:', e);
          }
          
          setLocationLoading(false);
        },
        (err) => {
          console.error('Location error:', err);
          setError('Could not get location. Please enter manually or try again.');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.emergencyType) {
      setError('Please select emergency type');
      return;
    }
    if (!formData.lat || !formData.lng) {
      setError('Please provide your location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Determine priority based on emergency type
      let priority: SOSRequest['priority'] = 'high';
      if (formData.emergencyType === 'trapped' || formData.emergencyType === 'fire') {
        priority = 'critical';
      } else if (formData.emergencyType === 'medical') {
        priority = 'high';
      } else if (formData.emergencyType === 'flood') {
        priority = formData.peopleCount > 3 ? 'critical' : 'high';
      }

      await createSOSRequest({
        location: {
          lat: formData.lat,
          lng: formData.lng,
          address: formData.address || undefined,
        },
        emergencyType: formData.emergencyType,
        description: formData.description || `${formData.emergencyType} emergency - ${formData.peopleCount} people`,
        priority,
        contactNumber: formData.contactNumber || undefined,
        peopleCount: formData.peopleCount,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('SOS submission error:', err);
      setError('Failed to send SOS. Please call emergency services directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({
      emergencyType: '' as SOSRequest['emergencyType'],
      description: '',
      lat: 0,
      lng: 0,
      address: '',
      contactNumber: '',
      peopleCount: 1,
      priority: 'high',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl p-6 max-w-md w-full border border-destructive max-h-[90vh] overflow-y-auto"
        >
          {/* Success State */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">SOS Sent!</h2>
              <p className="text-muted-foreground mb-6">
                Your emergency signal has been sent to nearby responders. Help is on the way.
              </p>
              <div className="space-y-3">
                <EmergencyCallButton
                  label="Call Emergency"
                  number="112"
                  variant="ambulance"
                  className="w-full justify-center"
                />
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Emergency SOS</h2>
                    <p className="text-xs text-muted-foreground">
                      {step === 1 ? 'Select emergency type' : 'Provide details'}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Emergency Type */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <Label className="text-base">What's your emergency?</Label>
                  <div className="grid gap-2">
                    {emergencyTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          updateForm('emergencyType', type.id);
                          handleGetLocation(); // Auto-get location
                          setStep(2);
                        }}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                          ${formData.emergencyType === type.id
                            ? 'border-destructive bg-destructive/10'
                            : 'border-border hover:border-destructive/50'
                          }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Your Location
                    </Label>
                    {locationLoading ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Getting your location...</span>
                      </div>
                    ) : formData.lat && formData.lng ? (
                      <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                        <div className="flex items-center gap-2 text-success text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Location captured
                        </div>
                        {formData.address && (
                          <p className="text-xs text-muted-foreground mt-1">{formData.address}</p>
                        )}
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetLocation}
                        className="w-full"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Get My Location
                      </Button>
                    )}
                  </div>

                  {/* People Count */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      People Needing Help
                    </Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => updateForm('peopleCount', count)}
                          className={`w-10 h-10 rounded-lg border-2 font-bold transition-all
                            ${formData.peopleCount === count
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                            }`}
                        >
                          {count}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateForm('peopleCount', 10)}
                        className={`flex-1 h-10 rounded-lg border-2 font-bold transition-all
                          ${formData.peopleCount >= 10
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        5+
                      </button>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Number (optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={(e) => updateForm('contactNumber', e.target.value)}
                      placeholder="For responders to call back"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Additional Details (optional)
                    </Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      placeholder="Any details that might help responders..."
                      className="w-full px-3 py-2 bg-background border border-input rounded-md min-h-[60px] text-sm"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-destructive hover:bg-destructive/90"
                      disabled={loading || (!formData.lat && !formData.lng)}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Send SOS
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Emergency Numbers */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Can't wait? Call directly:
                </p>
                <div className="flex gap-2">
                  <a 
                    href="tel:112" 
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-bold">112</span>
                  </a>
                  <a 
                    href="tel:100" 
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="font-bold">100</span>
                  </a>
                  <a 
                    href="tel:108" 
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span className="font-bold">108</span>
                  </a>
                  <a 
                    href="tel:101" 
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                  >
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">101</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
