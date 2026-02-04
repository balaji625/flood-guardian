import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Plus, 
  Trash2, 
  User, 
  Heart,
  Home,
  Briefcase,
  Users,
  Edit2,
  X,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: 'family' | 'friend' | 'neighbor' | 'work' | 'other';
  isPrimary: boolean;
}

interface EmergencyContactsProps {
  className?: string;
}

const RELATIONSHIP_CONFIG = {
  family: { icon: Heart, label: 'Family', color: 'text-pink-500' },
  friend: { icon: Users, label: 'Friend', color: 'text-blue-500' },
  neighbor: { icon: Home, label: 'Neighbor', color: 'text-green-500' },
  work: { icon: Briefcase, label: 'Work', color: 'text-purple-500' },
  other: { icon: User, label: 'Other', color: 'text-muted-foreground' },
};

const STORAGE_KEY = 'emergency-contacts';

export function EmergencyContacts({ className }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'family' as EmergencyContact['relationship'],
    isPrimary: false,
  });

  // Load contacts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch {
        console.error('Failed to load contacts');
      }
    }
  }, []);

  // Save contacts to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const resetForm = () => {
    setFormData({ name: '', phone: '', relationship: 'family', isPrimary: false });
    setEditingContact(null);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\d\s+-]{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (editingContact) {
      // Update existing contact
      setContacts(prev => prev.map(c => 
        c.id === editingContact.id 
          ? { ...c, ...formData }
          : formData.isPrimary && c.isPrimary ? { ...c, isPrimary: false } : c
      ));
      toast.success('Contact updated');
    } else {
      // Add new contact
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        ...formData,
      };
      
      // If new contact is primary, remove primary from others
      if (formData.isPrimary) {
        setContacts(prev => [...prev.map(c => ({ ...c, isPrimary: false })), newContact]);
      } else {
        setContacts(prev => [...prev, newContact]);
      }
      toast.success('Contact added');
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    toast.success('Contact deleted');
  };

  const handleCall = (phone: string, name: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
    toast.success(`Calling ${name}...`);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary,
    });
    setIsAddDialogOpen(true);
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card rounded-xl overflow-hidden', className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Emergency Contacts</h3>
              <p className="text-xs text-muted-foreground">
                Quick dial your loved ones
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value: EmergencyContact['relationship']) => 
                      setFormData(prev => ({ ...prev, relationship: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className={cn('w-4 h-4', config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="primary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Label htmlFor="primary" className="text-sm cursor-pointer">
                    Set as primary contact
                  </Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                    {editingContact ? 'Update' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No contacts added</p>
            <p className="text-xs">Add emergency contacts for quick access</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {sortedContacts.map((contact) => {
              const config = RELATIONSHIP_CONFIG[contact.relationship];
              const Icon = config.icon;

              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    contact.isPrimary 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border/50 bg-muted/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      contact.isPrimary ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{contact.name}</h4>
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="text-[10px]">Primary</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{contact.phone}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 h-8"
                        onClick={() => handleCall(contact.phone, contact.name)}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
