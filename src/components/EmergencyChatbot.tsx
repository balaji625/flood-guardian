import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Phone, MapPin, AlertTriangle, Building2, Truck, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Location, RiskLevel } from '@/types/flood';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  type: 'call' | 'navigate' | 'info';
  value: string;
  icon?: React.ReactNode;
}

interface EmergencyChatbotProps {
  location?: Location | null;
  riskLevel?: RiskLevel;
}

const EMERGENCY_NUMBERS = {
  police: '100',
  ambulance: '108',
  fire: '101',
  disaster: '1078',
  women: '1091',
};

const QUICK_ACTIONS = [
  { label: 'Is my area safe?', query: 'is my area safe' },
  { label: 'What should I do?', query: 'what should i do' },
  { label: 'Nearest hospital', query: 'nearest hospital' },
  { label: 'Evacuation steps', query: 'evacuation steps' },
  { label: 'Emergency numbers', query: 'emergency numbers' },
];

function generateBotResponse(query: string, riskLevel?: RiskLevel, location?: Location | null): Message {
  const q = query.toLowerCase();
  let content = '';
  let actions: ChatAction[] = [];

  // Safety check
  if (q.includes('safe') || q.includes('risk') || q.includes('danger')) {
    if (riskLevel === 'critical') {
      content = `⚠️ DANGER: Your area ${location?.name || ''} is at CRITICAL flood risk! Evacuate immediately to higher ground. Do not wait.`;
      actions = [
        { label: 'Call Disaster Helpline', type: 'call', value: EMERGENCY_NUMBERS.disaster, icon: <Phone className="w-4 h-4" /> },
      ];
    } else if (riskLevel === 'high') {
      content = `🔴 HIGH RISK: Your area ${location?.name || ''} has elevated flood danger. Prepare for immediate evacuation. Avoid low-lying areas and waterways.`;
      actions = [
        { label: 'View evacuation routes', type: 'navigate', value: '/map', icon: <MapPin className="w-4 h-4" /> },
      ];
    } else if (riskLevel === 'medium') {
      content = `🟡 MODERATE RISK: Stay alert in ${location?.name || 'your area'}. Monitor weather updates. Keep emergency supplies ready. Avoid flooded roads.`;
    } else {
      content = `🟢 LOW RISK: ${location?.name || 'Your area'} is currently safe. Continue monitoring weather forecasts. Keep emergency kit ready as a precaution.`;
    }
  }
  // What to do
  else if (q.includes('what should') || q.includes('what do') || q.includes('help')) {
    if (riskLevel === 'high' || riskLevel === 'critical') {
      content = `IMMEDIATE ACTIONS:\n1. Move to higher ground NOW\n2. Do not enter flood water\n3. Turn off electricity/gas if safe\n4. Take only essentials\n5. Help neighbors if possible\n6. Call emergency if trapped`;
      actions = [
        { label: 'Call 112 Emergency', type: 'call', value: '112', icon: <Phone className="w-4 h-4" /> },
      ];
    } else {
      content = `PREPAREDNESS STEPS:\n1. Charge all devices\n2. Store drinking water\n3. Keep documents in waterproof bag\n4. Know evacuation routes\n5. Keep emergency numbers handy\n6. Stay informed via local news`;
    }
  }
  // Nearest facilities
  else if (q.includes('hospital') || q.includes('medical')) {
    content = 'Nearest hospitals and medical facilities are shown on the map. You can call emergency medical services directly.';
    actions = [
      { label: 'Call Ambulance 108', type: 'call', value: EMERGENCY_NUMBERS.ambulance, icon: <Truck className="w-4 h-4" /> },
      { label: 'View on Map', type: 'navigate', value: '/map?filter=hospital', icon: <Building2 className="w-4 h-4" /> },
    ];
  }
  // Evacuation
  else if (q.includes('evacuat') || q.includes('shelter') || q.includes('route')) {
    content = `EVACUATION GUIDE:\n1. Follow marked evacuation routes\n2. Move to designated shelters\n3. Avoid flooded roads - turn around\n4. If trapped, go to highest floor\n5. Signal for help from window/roof\n6. Do not walk through moving water`;
    actions = [
      { label: 'View Safe Routes', type: 'navigate', value: '/map?layer=routes', icon: <MapPin className="w-4 h-4" /> },
    ];
  }
  // Emergency numbers
  else if (q.includes('number') || q.includes('call') || q.includes('phone') || q.includes('emergency')) {
    content = `EMERGENCY NUMBERS:\n🚔 Police: 100\n🚑 Ambulance: 108\n🚒 Fire: 101\n🆘 Disaster: 1078\n📞 Universal: 112`;
    actions = [
      { label: 'Police 100', type: 'call', value: EMERGENCY_NUMBERS.police, icon: <Phone className="w-4 h-4" /> },
      { label: 'Ambulance 108', type: 'call', value: EMERGENCY_NUMBERS.ambulance, icon: <Truck className="w-4 h-4" /> },
      { label: 'Fire 101', type: 'call', value: EMERGENCY_NUMBERS.fire, icon: <Flame className="w-4 h-4" /> },
    ];
  }
  // Fire/rescue
  else if (q.includes('fire') || q.includes('rescue') || q.includes('trapped')) {
    content = 'If you are trapped or need rescue, call Fire & Rescue immediately. Stay calm, move to higher ground if possible, and signal your location.';
    actions = [
      { label: 'Call Fire & Rescue 101', type: 'call', value: EMERGENCY_NUMBERS.fire, icon: <Flame className="w-4 h-4" /> },
    ];
  }
  // Default
  else {
    content = `I'm your Flood Emergency Assistant. I can help you with:\n• Check if your area is safe\n• Emergency contact numbers\n• Evacuation instructions\n• Nearest hospitals/shelters\n• Safety guidelines\n\nWhat do you need help with?`;
  }

  return {
    id: Date.now().toString(),
    type: 'bot',
    content,
    timestamp: new Date(),
    actions,
  };
}

export function EmergencyChatbot({ location, riskLevel }: EmergencyChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hello! I'm your Flood Emergency Assistant. I can help you check flood risk, find emergency services, and guide you to safety. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (query?: string) => {
    const message = query || input.trim();
    if (!message) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Generate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(message, riskLevel, location);
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleAction = (action: ChatAction) => {
    if (action.type === 'call') {
      window.location.href = `tel:${action.value}`;
    } else if (action.type === 'navigate') {
      window.location.href = action.value;
    }
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Flood Emergency AI</h3>
                  <p className="text-xs text-white/70">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-dark">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-2',
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2',
                      msg.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.actions.map((action, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant={action.type === 'call' ? 'destructive' : 'secondary'}
                            onClick={() => handleAction(action)}
                            className="text-xs"
                          >
                            {action.icon}
                            <span className="ml-1">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-border overflow-x-auto">
              <div className="flex gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <Button
                    key={action.query}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(action.query)}
                    className="text-xs whitespace-nowrap"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1"
              />
              <Button onClick={() => handleSend()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg',
          'bg-gradient-primary text-white',
          'hover:shadow-xl transition-shadow',
          isOpen && 'bg-secondary'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
