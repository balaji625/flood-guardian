import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Send,
  Droplets,
  Phone,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ref, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Location, CrowdReport } from '@/types/flood';

interface CrowdReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: Location | null;
}

type WaterLevel = 'ankle' | 'knee' | 'waist' | 'chest' | 'above';

const waterLevels: { id: WaterLevel; label: string; icon: string; color: string }[] = [
  { id: 'ankle', label: 'Ankle Deep', icon: '🦶', color: 'bg-yellow-500/20 border-yellow-500' },
  { id: 'knee', label: 'Knee Deep', icon: '🦵', color: 'bg-orange-500/20 border-orange-500' },
  { id: 'waist', label: 'Waist Deep', icon: '👤', color: 'bg-red-500/20 border-red-500' },
  { id: 'chest', label: 'Chest Deep', icon: '🧍', color: 'bg-red-600/20 border-red-600' },
  { id: 'above', label: 'Above Head / Impassable', icon: '⚠️', color: 'bg-red-700/20 border-red-700' },
];

export function CrowdReportModal({ isOpen, onClose, location }: CrowdReportModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    waterLevel: '' as WaterLevel,
    description: '',
    phone: '',
    lat: location?.lat || 0,
    lng: location?.lng || 0,
    address: location?.name || '',
    imageBase64: '',
  });

  const updateForm = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateForm('lat', position.coords.latitude);
          updateForm('lng', position.coords.longitude);
        },
        (err) => {
          console.error('Location error:', err);
          setError('Could not get location. Please enter manually.');
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        updateForm('imageBase64', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.waterLevel) {
      setError('Please select water level');
      return;
    }

    if (!formData.lat || !formData.lng) {
      setError('Please provide location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create report in Firebase
      const reportsRef = ref(database, 'crowdReports');
      const newReportRef = push(reportsRef);
      
      const report: Omit<CrowdReport, 'id'> & { imageBase64?: string } = {
        location: {
          lat: formData.lat,
          lng: formData.lng,
        },
        waterLevel: formData.waterLevel,
        description: formData.description || `${formData.waterLevel} level flooding reported`,
        timestamp: Date.now(),
        verified: false,
        reporterContact: formData.phone || undefined,
        imageBase64: formData.imageBase64 || undefined,
      };

      await set(newReportRef, report);

      setSubmitted(true);
    } catch (err: any) {
      console.error('Report submission error:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSubmitted(false);
    setFormData({
      waterLevel: '' as WaterLevel,
      description: '',
      phone: '',
      lat: location?.lat || 0,
      lng: location?.lng || 0,
      address: location?.name || '',
      imageBase64: '',
    });
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
          className="bg-card rounded-2xl p-6 max-w-md w-full border border-border max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Report Flooding</h2>
                <p className="text-xs text-muted-foreground">Help others stay safe</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Report Submitted!</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for helping keep your community safe. Your report will appear on the map shortly.
              </p>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Step 1: Water Level Selection */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <Label className="text-base">How deep is the water?</Label>
                  <div className="grid gap-2">
                    {waterLevels.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => updateForm('waterLevel', level.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          formData.waterLevel === level.id
                            ? level.color
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <span className="text-2xl">{level.icon}</span>
                        <span className="font-medium">{level.label}</span>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full"
                    disabled={!formData.waterLevel}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Location & Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="any"
                        value={formData.lat || ''}
                        onChange={(e) => updateForm('lat', parseFloat(e.target.value))}
                        placeholder="Latitude"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="any"
                        value={formData.lng || ''}
                        onChange={(e) => updateForm('lng', parseFloat(e.target.value))}
                        placeholder="Longitude"
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGetLocation}
                      className="w-full"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Use Current Location
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Area / Landmark (optional)</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      placeholder="e.g., Near Central Market"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Additional Details (optional)</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      placeholder="Any other details about the flooding..."
                      className="w-full px-3 py-2 bg-background border border-input rounded-md min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Photo & Contact */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Upload Photo (optional)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      {formData.imageBase64 ? (
                        <div className="relative">
                          <img
                            src={formData.imageBase64}
                            alt="Flood report"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => updateForm('imageBase64', '')}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                          <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            Tap to upload photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (optional, for callback)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        placeholder="Your phone number"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
