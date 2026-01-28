import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Waves, 
  Mail, 
  Lock, 
  ArrowLeft, 
  Shield, 
  Building2, 
  Truck, 
  Flame, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  MapPin,
  User,
  Phone,
  Stethoscope,
  CheckCircle,
  Loader2,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { AuthorityType, AUTHORITY_CONFIGS, ServiceArea } from '@/types/authority';

// Dynamic role options from config
const roleOptions = Object.entries(AUTHORITY_CONFIGS)
  .filter(([key]) => key !== 'admin') // Admin can't self-register
  .map(([id, config]) => ({
    id: id as AuthorityType,
    label: config.label,
    shortLabel: config.shortLabel,
    color: config.color,
  }));

const roleIcons: Record<AuthorityType, React.ElementType> = {
  police: Shield,
  doctor: Stethoscope,
  hospital: Building2,
  fire: Flame,
  ambulance: Truck,
  authority: AlertTriangle,
  admin: Shield,
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form data with comprehensive fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: '' as AuthorityType,
    department: '',
    stationName: '',
    stationAddress: '',
    phone: '',
    lat: 0,
    lng: 0,
    // Area details
    areaName: '',
    district: '',
    state: '',
    pincode: '',
  });

  const updateForm = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateForm('lat', position.coords.latitude);
          updateForm('lng', position.coords.longitude);
          setLocationLoading(false);
          // Try to reverse geocode
          fetchAddressFromCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error('Location error:', err);
          setError('Could not get your location. Please enter manually.');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.address) {
        updateForm('areaName', data.address.suburb || data.address.neighbourhood || '');
        updateForm('district', data.address.city || data.address.county || '');
        updateForm('state', data.address.state || '');
        updateForm('pincode', data.address.postcode || '');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all required fields');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.role) {
        setError('Please select your authority type');
        return false;
      }
      if (!formData.department) {
        setError('Please enter your department/unit name');
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.stationName || !formData.phone) {
        setError('Station name and phone are required');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    if (!validateStep(4)) return;

    setLoading(true);
    setError('');

    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Prepare service area data
      const serviceArea: ServiceArea = {
        id: `area_${Date.now()}`,
        name: formData.areaName || formData.stationAddress,
        pincode: formData.pincode || undefined,
        district: formData.district || 'Unknown',
        state: formData.state || 'Unknown',
        center: {
          lat: formData.lat,
          lng: formData.lng,
        },
      };

      // Save comprehensive user data to Realtime Database
      await set(ref(database, `users/${userCredential.user.uid}`), {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        department: formData.department,
        stationName: formData.stationName,
        stationAddress: formData.stationAddress,
        phone: formData.phone,
        location: {
          lat: formData.lat,
          lng: formData.lng,
        },
        serviceArea,
        createdAt: Date.now(),
        verified: true, // Auto-verify for demo; in production, set to false
        active: true,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleConfig = formData.role ? AUTHORITY_CONFIGS[formData.role] : null;
  const RoleIcon = formData.role ? roleIcons[formData.role] : Shield;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-radial-glow opacity-30" />
      <div className="fixed inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step > 1 ? 'Back' : 'Back to Login'}
        </Button>

        <div className="glass-card rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ 
                background: selectedRoleConfig?.color 
                  ? `linear-gradient(135deg, ${selectedRoleConfig.color}, ${selectedRoleConfig.color}80)`
                  : 'var(--gradient-primary)' 
              }}
            >
              <RoleIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Authority Registration</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {step === 1 && 'Create your account'}
              {step === 2 && 'Select your authority type'}
              {step === 3 && 'Station/Facility details'}
              {step === 4 && 'Service area & location'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    s === step 
                      ? 'bg-primary text-primary-foreground' 
                      : s < step 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-8 h-1 mx-1 rounded ${s < step ? 'bg-success' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Account Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name / Officer Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Official Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="your.email@gov.in"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-primary"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Authority Type Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Label>Select Your Authority Type *</Label>
                <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {roleOptions.map((role) => {
                    const Icon = roleIcons[role.id];
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => updateForm('role', role.id)}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          formData.role === role.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${role.color}20` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: role.color }} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{role.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {AUTHORITY_CONFIGS[role.id].emergencyNumber && 
                              `Emergency: ${AUTHORITY_CONFIGS[role.id].emergencyNumber}`
                            }
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department / Unit Name *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateForm('department', e.target.value)}
                    placeholder="e.g., Emergency Response Unit, ICU Ward"
                    required
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-primary"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 3: Station Details */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="stationName">Station / Facility Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="stationName"
                      value={formData.stationName}
                      onChange={(e) => updateForm('stationName', e.target.value)}
                      placeholder="e.g., Central Fire Station, City Hospital"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stationAddress">Complete Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      id="stationAddress"
                      value={formData.stationAddress}
                      onChange={(e) => updateForm('stationAddress', e.target.value)}
                      placeholder="Full address with street, area, city, PIN code"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md min-h-[80px] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Emergency Contact Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      placeholder="24x7 contact number"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-primary"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 4: Location & Service Area */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Station GPS Location</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="w-full gap-2"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Map className="w-4 h-4" />
                    )}
                    {locationLoading ? 'Getting Location...' : 'Auto-Detect Location'}
                  </Button>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="any"
                      value={formData.lat || ''}
                      onChange={(e) => updateForm('lat', parseFloat(e.target.value) || 0)}
                      placeholder="Latitude"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="any"
                      value={formData.lng || ''}
                      onChange={(e) => updateForm('lng', parseFloat(e.target.value) || 0)}
                      placeholder="Longitude"
                      className="flex-1"
                    />
                  </div>
                  {formData.lat !== 0 && formData.lng !== 0 && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Location captured successfully
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="areaName">Area / Locality</Label>
                    <Input
                      id="areaName"
                      value={formData.areaName}
                      onChange={(e) => updateForm('areaName', e.target.value)}
                      placeholder="e.g., Bandra West"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => updateForm('pincode', e.target.value)}
                      placeholder="e.g., 400050"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="district">District / City</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => updateForm('district', e.target.value)}
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => updateForm('state', e.target.value)}
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </form>

          {/* Link to Login */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your account will be activated immediately for demo purposes.
          <br />
          In production, admin verification would be required.
        </p>
      </motion.div>
    </div>
  );
}
