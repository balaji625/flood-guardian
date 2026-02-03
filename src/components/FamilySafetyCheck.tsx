import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Check, 
  Send, 
  UserPlus, 
  Phone, 
  Clock, 
  MapPin,
  Heart,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  isSafe?: boolean;
  lastUpdate?: number;
  location?: string;
}

interface FamilySafetyCheckProps {
  className?: string;
  currentLocation?: { name: string; lat: number; lng: number } | null;
}

export function FamilySafetyCheck({ className, currentLocation }: FamilySafetyCheckProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [userSafeStatus, setUserSafeStatus] = useState<'unknown' | 'safe' | 'needsHelp'>('unknown');

  // Load members from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('familyMembers');
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
      } catch {
        // Invalid data
      }
    }
  }, []);

  // Save members to localStorage
  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem('familyMembers', JSON.stringify(members));
    }
  }, [members]);

  const handleAddMember = () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast.error('Please enter name and phone number');
      return;
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(newPhone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
    };
    
    setMembers(prev => [...prev, newMember]);
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
    toast.success(`${newMember.name} added to family safety circle`);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    toast.success('Member removed');
  };

  const handleMarkSafe = async () => {
    setIsSending(true);
    setUserSafeStatus('safe');
    
    // Simulate sending SMS/notification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would send actual SMS via Firebase/Twilio
    toast.success(
      `Safety status shared with ${members.length} family member${members.length !== 1 ? 's' : ''}`
    );
    
    setIsSending(false);
  };

  const handleNeedHelp = async () => {
    setIsSending(true);
    setUserSafeStatus('needsHelp');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(
      'Help request sent! Your location has been shared with family members.',
      { duration: 5000 }
    );
    
    setIsSending(false);
  };

  const handleCheckIn = (memberId: string) => {
    // Simulate receiving check-in
    setMembers(prev => prev.map(m => 
      m.id === memberId 
        ? { ...m, isSafe: true, lastUpdate: Date.now(), location: 'Near Home' }
        : m
    ));
    toast.success('Check-in request sent via SMS');
  };

  const safeCount = members.filter(m => m.isSafe).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card rounded-xl overflow-hidden', className)}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-success" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">Family Safety Check</h3>
            <p className="text-xs text-muted-foreground">
              {members.length === 0 
                ? 'Add family members to track safety'
                : `${safeCount}/${members.length} marked safe`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userSafeStatus === 'safe' && (
            <Badge variant="default" className="bg-success gap-1">
              <Check className="w-3 h-3" /> You're Safe
            </Badge>
          )}
          {userSafeStatus === 'needsHelp' && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" /> Help Requested
            </Badge>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-muted-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50"
          >
            {/* Your Safety Status */}
            <div className="p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-3 font-medium">Your Safety Status</p>
              <div className="flex gap-2">
                <Button
                  onClick={handleMarkSafe}
                  disabled={isSending}
                  className={cn(
                    'flex-1 gap-2',
                    userSafeStatus === 'safe' && 'bg-success hover:bg-success/90'
                  )}
                  variant={userSafeStatus === 'safe' ? 'default' : 'outline'}
                >
                  {isSending && userSafeStatus === 'safe' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  I'm Safe
                </Button>
                <Button
                  onClick={handleNeedHelp}
                  disabled={isSending}
                  variant={userSafeStatus === 'needsHelp' ? 'destructive' : 'outline'}
                  className="flex-1 gap-2"
                >
                  {isSending && userSafeStatus === 'needsHelp' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  Need Help
                </Button>
              </div>
              {currentLocation && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Location: {currentLocation.name}
                </p>
              )}
            </div>

            {/* Family Members */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">Family Members</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <UserPlus className="w-3 h-3" />
                  Add
                </Button>
              </div>

              {/* Add Member Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="space-y-2">
                      <Input
                        placeholder="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Input
                        placeholder="Phone (10 digits)"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="h-9 text-sm"
                        type="tel"
                        maxLength={10}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1" onClick={handleAddMember}>
                          Add Member
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Members List */}
              {members.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No family members added yet</p>
                  <p className="text-xs">Add members to share your safety status</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                          member.isSafe 
                            ? 'bg-success/20 text-success' 
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {member.isSafe ? <Check className="w-4 h-4" /> : member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.isSafe ? (
                          <Badge variant="outline" className="text-success border-success/50 gap-1">
                            <Clock className="w-3 h-3" />
                            Safe
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => handleCheckIn(member.id)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Check
                          </Button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
