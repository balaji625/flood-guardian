import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, Mail, Lock, ArrowLeft, Shield, Building2, Truck, Flame, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const roles = [
  { id: 'admin', label: 'System Admin', icon: Shield, email: 'admin@flood.gov' },
  { id: 'authority', label: 'Disaster Authority', icon: AlertTriangle, email: 'authority@flood.gov' },
  { id: 'police', label: 'Police', icon: Shield, email: 'police@flood.gov' },
  { id: 'hospital', label: 'Hospital', icon: Building2, email: 'hospital@flood.gov' },
  { id: 'ambulance', label: 'Ambulance', icon: Truck, email: 'ambulance@flood.gov' },
  { id: 'fire', label: 'Fire & Rescue', icon: Flame, email: 'fire@flood.gov' },
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setLoading(true);
    setLoginError('');

    try {
      await signIn(demoEmail, 'demo123');
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Failed to sign in');
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
        className="w-full max-w-md relative z-10"
      >
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="glass-card rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
              <Waves className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Authority Login</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Access emergency response dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
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

            {(loginError || error) && (
              <p className="text-sm text-destructive">{loginError || error}</p>
            )}

            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Demo accounts (password: demo123)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <Button
                  key={role.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(role.email)}
                  disabled={loading}
                  className="flex items-center gap-2 text-xs"
                >
                  <role.icon className="w-4 h-4" />
                  {role.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            New authority?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:underline"
            >
              Register here
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          For authorized personnel only. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
}
