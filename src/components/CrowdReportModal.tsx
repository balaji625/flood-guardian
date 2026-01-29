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
  Loader2,
  Image as ImageIcon,
  Plus,
  Trash2
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

const waterLevels: { id: WaterLevel; label: string; icon: string; color: string; severity: string }[] = [
  { id: 'ankle', label: 'Ankle Deep (~15cm)', icon: '🦶', color: 'bg-yellow-500/20 border-yellow-500', severity: 'Minor' },
  { id: 'knee', label: 'Knee Deep (~45cm)', icon: '🦵', color: 'bg-orange-500/20 border-orange-500', severity: 'Moderate' },
  { id: 'waist', label: 'Waist Deep (~90cm)', icon: '👤', color: 'bg-red-500/20 border-red-500', severity: 'Severe' },
  { id: 'chest', label: 'Chest Deep (~120cm)', icon: '🧍', color: 'bg-red-600/20 border-red-600', severity: 'Critical' },
  { id: 'above', label: 'Above Head / Impassable', icon: '⚠️', color: 'bg-red-700/20 border-red-700', severity: 'Extreme' },
];

// Helper function to convert image file to base64 URL
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function CrowdReportModal({ isOpen, onClose, location }: CrowdReportModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    waterLevel: '' as WaterLevel,
    description: '',
    phone: '',
    lat: location?.lat || 0,
    lng: location?.lng || 0,
    address: location?.name || '',
    imageUrls: [] as string[], // Multiple image URLs
  });

  const updateForm = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          updateForm('lat', position.coords.latitude);
          updateForm('lng', position.coords.longitude);
          
          // Reverse geocoding for address
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
          setError('Could not get location. Please enter manually.');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 5;
    const currentCount = formData.imageUrls.length;
    const remainingSlots = maxImages - currentCount;

    if (remainingSlots <= 0) {
      setError('Maximum 5 images allowed');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newImageUrls: string[] = [];

    for (const file of filesToProcess) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        continue;
      }
      
      try {
        const base64Url = await fileToBase64(file);
        newImageUrls.push(base64Url);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    updateForm('imageUrls', [...formData.imageUrls, ...newImageUrls]);
    setError('');
  };

  const removeImage = (index: number) => {
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    updateForm('imageUrls', newUrls);
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
      // Create report in Firebase with multiple image URLs
      const reportsRef = ref(database, 'crowdReports');
      const newReportRef = push(reportsRef);
      
      const report: Omit<CrowdReport, 'id'> & { 
        imageUrls?: string[];
        address?: string;
        broadcastToAll: boolean;
      } = {
        location: {
          lat: formData.lat,
          lng: formData.lng,
        },
        waterLevel: formData.waterLevel,
        description: formData.description || `${formData.waterLevel} level flooding reported`,
        timestamp: Date.now(),
        verified: false,
        reporterContact: formData.phone || undefined,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
        address: formData.address || undefined,
        // Flag to broadcast to ALL authorities
        broadcastToAll: true,
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
      imageUrls: [],
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
          className="bg-card rounded-2xl max-w-md w-full border border-border max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-official shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Report Flooding</h2>
                  <p className="text-xs text-muted-foreground">
                    Help authorities respond faster
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress indicator */}
            {!submitted && (
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      s <= step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
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
                <h3 className="text-xl font-bold mb-2">Report Submitted!</h3>
                <p className="text-muted-foreground mb-6">
                  Your report has been sent to <strong>all relevant authorities</strong>. 
                  Thank you for helping keep your community safe.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground">
                    Your report will be visible on:
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Police Dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Fire & Rescue Dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Disaster Management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Public Flood Map
                    </li>
                  </ul>
                </div>
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
                    <Label className="text-base font-semibold">How deep is the water?</Label>
                    <div className="space-y-2">
                      {waterLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => {
                            updateForm('waterLevel', level.id);
                            handleGetLocation();
                          }}
                          className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                            formData.waterLevel === level.id
                              ? level.color
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-2xl">{level.icon}</span>
                          <div className="text-left flex-1">
                            <span className="font-medium block">{level.label}</span>
                            <span className="text-xs text-muted-foreground">
                              Severity: {level.severity}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      className="w-full mt-4"
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
                      <Label className="font-semibold">Location</Label>
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
                          <p className="text-xs font-mono text-muted-foreground mt-1">
                            {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                          </p>
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

                    <div className="space-y-2">
                      <Label htmlFor="address">Area / Landmark (optional)</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        placeholder="e.g., Near Central Market, Main Road"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Additional Details</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateForm('description', e.target.value)}
                        placeholder="Describe the flooding situation, road conditions, etc..."
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg min-h-[100px] text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
                        disabled={!formData.lat || !formData.lng}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Photos & Contact */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="font-semibold flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Upload Photos (up to 5)
                      </Label>
                      
                      {/* Image Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {formData.imageUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                            <img
                              src={url}
                              alt={`Flood report ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-80"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Add more button */}
                        {formData.imageUrls.length < 5 && (
                          <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                            <Plus className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">Add</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Photos help authorities assess the situation quickly
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number (optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        placeholder="For authorities to contact if needed"
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">Report Summary</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Water Level: <span className="text-foreground capitalize">{formData.waterLevel}</span></p>
                        <p>Location: <span className="text-foreground">{formData.address || 'Coordinates captured'}</span></p>
                        <p>Photos: <span className="text-foreground">{formData.imageUrls.length} attached</span></p>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
