import React, { useState } from 'react';
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
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { UserRole } from '@/types/flood';

const roleOptions = [
  { id: 'police' as UserRole, label: 'Police Station', icon: Shield },
  { id: 'hospital' as UserRole, label: 'Hospital', icon: Building2 },
  { id: 'ambulance' as UserRole, label: 'Ambulance Service', icon: Truck },
  { id: 'fire' as UserRole, label: 'Fire & Rescue', icon: Flame },
  { id: 'authority' as UserRole, label: 'Disaster Management', icon: AlertTriangle },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: '' as UserRole,
    department: '',
    stationName: '',
    stationAddress: '',
    phone: '',
    lat: 0,
    lng: 0,
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
          setError('Could not get your location. Please enter manually.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.role) {
      setError('Please select your department type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Save user data to Realtime Database
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
        createdAt: Date.now(),
        verified: false, // Admin needs to verify
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
              <Waves className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Authority Registration</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Register your department for emergency response
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
                }`}
              />
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
                  <Label htmlFor="name">Full Name / Officer Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="Enter your name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Official Email</Label>
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      placeholder="Create a password"
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      placeholder="Confirm password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-primary"
                  disabled={!formData.name || !formData.email || !formData.password}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 2: Department Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Label>Select Your Department</Label>
                <div className="grid gap-3">
                  {roleOptions.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => updateForm('role', role.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        formData.role === role.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.role === role.id ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <role.icon className={`w-5 h-5 ${
                          formData.role === role.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <span className="font-medium">{role.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department Name / Unit</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateForm('department', e.target.value)}
                    placeholder="e.g., Emergency Response Unit"
                    required
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-gradient-primary"
                  disabled={!formData.role || !formData.department}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 3: Station Location */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="stationName">Station / Facility Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="stationName"
                      value={formData.stationName}
                      onChange={(e) => updateForm('stationName', e.target.value)}
                      placeholder="e.g., Central Fire Station"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stationAddress">Station Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      id="stationAddress"
                      value={formData.stationAddress}
                      onChange={(e) => updateForm('stationAddress', e.target.value)}
                      placeholder="Full address with city, district, PIN"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md min-h-[80px] text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      placeholder="Emergency contact number"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Station GPS Location</Label>
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

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={loading || !formData.stationName || !formData.phone}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
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
          Your registration will be verified by system administrators
        </p>
      </motion.div>
    </div>
  );
}
