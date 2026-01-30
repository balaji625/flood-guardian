import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Building2, 
  Truck, 
  Flame,
  Shield,
  Loader2,
  Map as MapIcon,
  Navigation,
  Clock,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  Mic,
  MicOff,
  History,
  Trash2,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Location, RiskLevel } from '@/types/flood';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
  mapData?: MapData;
  isTyping?: boolean;
}

interface ChatAction {
  label: string;
  type: 'call' | 'navigate' | 'info' | 'sos' | 'report';
  value: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
}

interface MapData {
  center: { lat: number; lng: number };
  markers?: { lat: number; lng: number; label: string; type: string }[];
  zoom?: number;
}

interface AdvancedChatbotProps {
  location?: Location | null;
  riskLevel?: RiskLevel;
  onTriggerSOS?: () => void;
  onTriggerReport?: () => void;
}

const EMERGENCY_NUMBERS = {
  police: '100',
  ambulance: '108',
  fire: '101',
  disaster: '1078',
  women: '1091',
  universal: '112',
};

const QUICK_ACTIONS = [
  { label: '🛡️ Is my area safe?', query: 'is my area safe', color: 'from-emerald-500 to-teal-500' },
  { label: '📋 What should I do?', query: 'what should i do in flood', color: 'from-violet-500 to-purple-500' },
  { label: '🏥 Nearest hospital', query: 'find nearest hospital', color: 'from-pink-500 to-rose-500' },
  { label: '🚨 Report flooding', query: 'report flooding', color: 'from-orange-500 to-red-500' },
  { label: '📞 Emergency numbers', query: 'emergency numbers', color: 'from-blue-500 to-cyan-500' },
  { label: '🗺️ Evacuation routes', query: 'show evacuation routes', color: 'from-amber-500 to-yellow-500' },
];

// Emergency services locations (sample data)
const NEARBY_SERVICES = [
  { lat: 19.076, lng: 72.8777, label: 'City General Hospital', type: 'hospital' },
  { lat: 19.08, lng: 72.88, label: 'Central Police Station', type: 'police' },
  { lat: 19.07, lng: 72.87, label: 'Fire Station No. 1', type: 'fire' },
  { lat: 19.082, lng: 72.872, label: 'Flood Relief Shelter', type: 'shelter' },
  { lat: 19.075, lng: 72.875, label: 'Ambulance Depot', type: 'ambulance' },
];

// AI-like response generation with typing effect
function generateBotResponse(
  query: string, 
  riskLevel?: RiskLevel, 
  location?: Location | null
): Message {
  const q = query.toLowerCase();
  let content = '';
  let actions: ChatAction[] = [];
  let mapData: MapData | undefined;

  // SOS / Report triggers
  if (q.includes('sos') || q.includes('help me') || q.includes('emergency help')) {
    content = '🚨 **EMERGENCY DETECTED**\n\nI can help you send an SOS signal immediately. This will alert nearby authorities with your location.\n\nTap the button below to send your emergency signal.';
    actions = [
      { label: 'Send SOS Signal', type: 'sos', value: 'sos', icon: <AlertTriangle className="w-4 h-4" />, variant: 'destructive' },
      { label: 'Call 112', type: 'call', value: '112', icon: <Phone className="w-4 h-4" />, variant: 'destructive' },
    ];
    return { id: Date.now().toString(), type: 'bot', content, timestamp: new Date(), actions };
  }

  // Report flooding
  if (q.includes('report') && (q.includes('flood') || q.includes('water'))) {
    content = '📝 **Report Flooding**\n\nYou can submit a crowd report to help others know about flooding conditions in your area.\n\nYour report will:\n• Alert nearby authorities\n• Update the live flood map\n• Help others avoid dangerous areas';
    actions = [
      { label: 'Submit Report', type: 'report', value: 'report', icon: <MapPin className="w-4 h-4" /> },
    ];
    return { id: Date.now().toString(), type: 'bot', content, timestamp: new Date(), actions };
  }

  // Safety check with map
  if (q.includes('safe') || q.includes('risk') || q.includes('danger')) {
    const locationName = location?.name || 'your area';
    
    if (riskLevel === 'critical') {
      content = `⚠️ **CRITICAL FLOOD ALERT**\n\n**Location:** ${locationName}\n**Status:** EVACUATE IMMEDIATELY\n\nYour area is at critical flood risk. Move to higher ground now. Do not wait.\n\n**Immediate Actions:**\n1. Leave immediately via higher ground\n2. Avoid all flooded roads\n3. Call 112 if trapped`;
      actions = [
        { label: 'Call Disaster Helpline', type: 'call', value: EMERGENCY_NUMBERS.disaster, icon: <Phone className="w-4 h-4" />, variant: 'destructive' },
        { label: 'Send SOS', type: 'sos', value: 'sos', icon: <AlertTriangle className="w-4 h-4" />, variant: 'destructive' },
      ];
    } else if (riskLevel === 'high') {
      content = `🔴 **HIGH FLOOD RISK**\n\n**Location:** ${locationName}\n**Status:** Prepare for evacuation\n\nFlood risk is elevated. Be ready to evacuate at short notice.\n\n**Preparation Steps:**\n1. Pack essential documents\n2. Charge all devices\n3. Know your evacuation route`;
      actions = [
        { label: 'View Evacuation Routes', type: 'navigate', value: '/map?layer=routes', icon: <Navigation className="w-4 h-4" /> },
      ];
      if (location) {
        mapData = {
          center: { lat: location.lat, lng: location.lng },
          markers: NEARBY_SERVICES.slice(0, 3).map(s => ({
            lat: s.lat + (Math.random() - 0.5) * 0.02,
            lng: s.lng + (Math.random() - 0.5) * 0.02,
            label: s.label,
            type: s.type
          })),
          zoom: 14
        };
      }
    } else if (riskLevel === 'medium') {
      content = `🟡 **MODERATE RISK**\n\n**Location:** ${locationName}\n**Status:** Stay alert\n\nFlood risk is moderate. Monitor weather updates and keep emergency supplies ready.\n\n**Recommendations:**\n• Stay informed via local news\n• Avoid low-lying areas\n• Keep emergency kit accessible`;
    } else {
      content = `🟢 **LOW RISK**\n\n**Location:** ${locationName}\n**Status:** Currently safe\n\nNo immediate flood threat detected. Continue monitoring weather forecasts.\n\n**Precautions:**\n• Keep emergency kit ready\n• Know your evacuation route\n• Stay informed`;
    }
  }
  // Hospital/medical with map
  else if (q.includes('hospital') || q.includes('medical') || q.includes('doctor')) {
    content = '🏥 **Nearest Medical Facilities**\n\nI\'ve found nearby hospitals and medical services. You can call emergency medical services or navigate to the nearest hospital.\n\n**Note:** In emergencies, call 108 for immediate ambulance dispatch.';
    actions = [
      { label: 'Call Ambulance 108', type: 'call', value: EMERGENCY_NUMBERS.ambulance, icon: <Truck className="w-4 h-4" />, variant: 'destructive' },
    ];
    
    const centerLat = location?.lat || 19.076;
    const centerLng = location?.lng || 72.877;
    mapData = {
      center: { lat: centerLat, lng: centerLng },
      markers: [
        { lat: centerLat + 0.005, lng: centerLng + 0.003, label: 'City General Hospital', type: 'hospital' },
        { lat: centerLat - 0.003, lng: centerLng + 0.005, label: 'District Hospital', type: 'hospital' },
        { lat: centerLat + 0.002, lng: centerLng - 0.004, label: 'Primary Health Center', type: 'hospital' },
      ],
      zoom: 14
    };
  }
  // Police with map
  else if (q.includes('police') || q.includes('security')) {
    content = '👮 **Police Emergency**\n\nNearest police stations are shown on the map. For immediate police assistance, call 100.';
    actions = [
      { label: 'Call Police 100', type: 'call', value: EMERGENCY_NUMBERS.police, icon: <Shield className="w-4 h-4" />, variant: 'destructive' },
    ];
    
    const centerLat = location?.lat || 19.076;
    const centerLng = location?.lng || 72.877;
    mapData = {
      center: { lat: centerLat, lng: centerLng },
      markers: [
        { lat: centerLat + 0.004, lng: centerLng + 0.002, label: 'Central Police Station', type: 'police' },
        { lat: centerLat - 0.002, lng: centerLng + 0.004, label: 'Traffic Police Post', type: 'police' },
      ],
      zoom: 14
    };
  }
  // Evacuation routes with map
  else if (q.includes('evacuat') || q.includes('shelter') || q.includes('route')) {
    content = `🗺️ **Evacuation Information**\n\n**Safe Evacuation Steps:**\n1. Move to higher ground immediately\n2. Follow marked evacuation routes\n3. Go to designated relief shelters\n4. Avoid flooded roads completely\n5. If trapped, go to highest floor and signal\n\n**Key Shelters** are shown on the map below.`;
    actions = [
      { label: 'Open Full Map', type: 'navigate', value: '/map?layer=routes', icon: <MapIcon className="w-4 h-4" /> },
    ];
    
    const centerLat = location?.lat || 19.076;
    const centerLng = location?.lng || 72.877;
    mapData = {
      center: { lat: centerLat, lng: centerLng },
      markers: [
        { lat: centerLat + 0.008, lng: centerLng + 0.005, label: 'Community Relief Center', type: 'shelter' },
        { lat: centerLat + 0.015, lng: centerLng - 0.003, label: 'School Evacuation Shelter', type: 'shelter' },
        { lat: centerLat - 0.005, lng: centerLng + 0.012, label: 'Government Relief Camp', type: 'shelter' },
      ],
      zoom: 13
    };
  }
  // Emergency numbers
  else if (q.includes('number') || q.includes('call') || q.includes('phone') || q.includes('contact')) {
    content = `📞 **Emergency Contact Numbers**\n\n| Service | Number |\n|---------|--------|\n| 🚔 Police | 100 |\n| 🚑 Ambulance | 108 |\n| 🚒 Fire & Rescue | 101 |\n| 🆘 Disaster Management | 1078 |\n| 📞 Universal Emergency | 112 |\n| 👩 Women Helpline | 1091 |\n\n**Tip:** 112 works even without network coverage.`;
    actions = [
      { label: 'Police 100', type: 'call', value: EMERGENCY_NUMBERS.police, icon: <Shield className="w-4 h-4" /> },
      { label: 'Ambulance 108', type: 'call', value: EMERGENCY_NUMBERS.ambulance, icon: <Truck className="w-4 h-4" /> },
      { label: 'Fire 101', type: 'call', value: EMERGENCY_NUMBERS.fire, icon: <Flame className="w-4 h-4" /> },
      { label: 'Universal 112', type: 'call', value: EMERGENCY_NUMBERS.universal, icon: <Phone className="w-4 h-4" />, variant: 'destructive' },
    ];
  }
  // Fire/rescue
  else if (q.includes('fire') || q.includes('rescue') || q.includes('trapped')) {
    content = '🚒 **Fire & Rescue Services**\n\nIf you are trapped or need rescue, call Fire & Rescue immediately.\n\n**While waiting:**\n• Stay calm and conserve energy\n• Move to highest accessible point\n• Signal your location (light, cloth, noise)\n• Do not enter water if possible';
    actions = [
      { label: 'Call Fire & Rescue 101', type: 'call', value: EMERGENCY_NUMBERS.fire, icon: <Flame className="w-4 h-4" />, variant: 'destructive' },
      { label: 'Send SOS', type: 'sos', value: 'sos', icon: <AlertTriangle className="w-4 h-4" />, variant: 'destructive' },
    ];
  }
  // Weather related
  else if (q.includes('weather') || q.includes('rain') || q.includes('forecast')) {
    content = `🌧️ **Weather Information**\n\nBased on current weather data:\n\n**Current Conditions:**\n• Heavy rainfall expected in many areas\n• High humidity levels\n• Strong winds in coastal regions\n\n**Recommendations:**\n• Stay indoors if possible\n• Monitor official weather alerts\n• Keep emergency supplies ready`;
    actions = [
      { label: 'Check Full Forecast', type: 'info', value: 'detailed weather forecast' },
    ];
  }
  // What to do
  else if (q.includes('what should') || q.includes('what do') || q.includes('how to') || q.includes('prepare')) {
    if (riskLevel === 'high' || riskLevel === 'critical') {
      content = `🚨 **IMMEDIATE ACTION REQUIRED**\n\nGiven the current high flood risk:\n\n**Do Now:**\n1. ✅ Move to higher ground IMMEDIATELY\n2. ✅ Do NOT enter flood water\n3. ✅ Turn off electricity/gas if safe\n4. ✅ Take only essential items\n5. ✅ Help elderly/disabled neighbors\n6. ✅ Call 112 if trapped\n\n**Do NOT:**\n❌ Walk through moving water\n❌ Drive through flooded roads\n❌ Return home until cleared`;
      actions = [
        { label: 'Call 112 Emergency', type: 'call', value: '112', icon: <Phone className="w-4 h-4" />, variant: 'destructive' },
        { label: 'Send SOS', type: 'sos', value: 'sos', icon: <AlertTriangle className="w-4 h-4" />, variant: 'destructive' },
      ];
    } else {
      content = `📋 **Flood Preparedness Guide**\n\n**Prepare Now:**\n1. 📱 Charge all devices fully\n2. 💧 Store drinking water (4L per person)\n3. 📄 Keep documents in waterproof bag\n4. 🗺️ Know evacuation routes\n5. 📞 Save emergency numbers\n6. 🔦 Keep flashlight & batteries ready\n7. 💊 Stock first-aid kit & medicines\n\n**Stay Informed:**\n• Monitor local news\n• Check official alerts\n• Follow authority instructions`;
    }
  }
  // Greetings
  else if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('good')) {
    content = `👋 **Hello! I'm FloodGuard AI**\n\nI'm your official emergency response assistant. I'm here to help you with:\n\n• 🛡️ Real-time flood risk assessment\n• 📞 Emergency contact numbers\n• 🗺️ Evacuation routes & shelters\n• 🏥 Nearby hospitals & services\n• 🚨 SOS & incident reporting\n\n**How can I assist you today?**`;
  }
  // Thanks
  else if (q.includes('thank') || q.includes('thanks')) {
    content = `🙏 **You're welcome!**\n\nStay safe and don't hesitate to ask if you need any more assistance. Remember:\n\n• In emergencies, call **112**\n• For floods, call **1078**\n• Report any flooding you see\n\n**Stay alert, stay safe!**`;
  }
  // Default
  else {
    content = `👋 **FloodGuard AI Assistant**\n\nI understand you asked about: *"${query}"*\n\nI can help you with:\n\n• 🛡️ **Safety Check** - Is my area safe?\n• 📞 **Emergency Contacts** - Police, ambulance, fire\n• 🗺️ **Evacuation** - Routes & shelter locations\n• 🏥 **Medical** - Nearby hospitals\n• 🚨 **Reporting** - Report flooding\n• 📋 **Guidelines** - What to do in floods\n\n**Try asking something like:**\n- "Is my area safe?"\n- "Where is the nearest hospital?"\n- "Show emergency numbers"`;
    actions = QUICK_ACTIONS.slice(0, 3).map(a => ({
      label: a.label,
      type: 'info' as const,
      value: a.query,
    }));
  }

  return {
    id: Date.now().toString(),
    type: 'bot',
    content,
    timestamp: new Date(),
    actions: actions.length > 0 ? actions : undefined,
    mapData,
  };
}

// Mini Map Component for chat
function ChatMiniMap({ mapData }: { mapData: MapData }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border-2 border-primary/30 h-48">
      <MapContainer
        center={[mapData.center.lat, mapData.center.lng]}
        zoom={mapData.zoom || 14}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mapData.markers?.map((marker, i) => (
          <Marker key={i} position={[marker.lat, marker.lng]}>
            <Popup>
              <strong>{marker.label}</strong>
              <br />
              <span className="text-xs capitalize">{marker.type}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function AdvancedChatbot({ 
  location, 
  riskLevel, 
  onTriggerSOS, 
  onTriggerReport 
}: AdvancedChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `👋 **Welcome to FloodGuard AI**\n\nI'm your intelligent emergency assistant. Ask me anything about:\n\n• 🛡️ Flood safety & risk levels\n• 🏥 Nearby emergency services\n• 🗺️ Evacuation routes\n• 📞 Emergency contacts\n\n**Type your question below or use quick actions!**`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (query?: string) => {
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
    setIsTyping(true);

    // Simulate AI thinking time with realistic delay
    const thinkingTime = 600 + Math.random() * 600;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    // Generate bot response
    const botResponse = generateBotResponse(message, riskLevel, location);
    setIsTyping(false);
    setMessages(prev => [...prev, botResponse]);
  };

  const handleAction = (action: ChatAction) => {
    if (action.type === 'call') {
      window.location.href = `tel:${action.value}`;
    } else if (action.type === 'navigate') {
      window.location.href = action.value;
    } else if (action.type === 'sos') {
      onTriggerSOS?.();
    } else if (action.type === 'report') {
      onTriggerReport?.();
    } else if (action.type === 'info') {
      handleSend(action.value);
    }
  };

  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  }, []);

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      type: 'bot',
      content: `🔄 **Chat Cleared**\n\nI'm ready to help you again! Ask me about flood safety, emergency services, or evacuation routes.`,
      timestamp: new Date(),
    }]);
    setShowHistory(false);
  };

  const formatContent = (content: string) => {
    // Enhanced markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "absolute bottom-20 right-0 bg-card border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden",
              isExpanded ? "w-[450px] h-[650px]" : "w-80 sm:w-[380px]"
            )}
            style={{ boxShadow: '0 0 60px hsl(262 83% 58% / 0.2)' }}
          >
            {/* Header - Colorful gradient */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    FloodGuard AI
                    <span className="px-2 py-0.5 text-[10px] bg-white/20 rounded-full">PRO</span>
                  </h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearChat}
                  className="text-white/80 hover:text-white hover:bg-white/20"
                  title="Clear chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white/80 hover:text-white hover:bg-white/20"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div 
              className={cn(
                "overflow-y-auto p-4 space-y-4 custom-scrollbar",
                isExpanded ? "h-[480px]" : "h-72"
              )}
              style={{ background: 'linear-gradient(180deg, hsl(255 25% 8%) 0%, hsl(260 30% 6%) 100%)' }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    'flex gap-2',
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3',
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                        : 'bg-muted/80 border border-primary/20'
                    )}
                  >
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                    />
                    
                    {/* Map integration */}
                    {msg.mapData && <ChatMiniMap mapData={msg.mapData} />}
                    
                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.actions.map((action, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                            onClick={() => handleAction(action)}
                            className={cn(
                              "text-xs gap-1 rounded-xl",
                              action.variant === 'destructive' && "animate-pulse bg-gradient-to-r from-red-500 to-rose-600 border-0"
                            )}
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted/80 border border-primary/20 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions - Scrollable colorful chips */}
            <div className="px-3 py-2 border-t border-primary/20 overflow-x-auto bg-card/50">
              <div className="flex gap-2 pb-1">
                {QUICK_ACTIONS.map((action) => (
                  <Button
                    key={action.query}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(action.query)}
                    className={cn(
                      "text-xs whitespace-nowrap shrink-0 rounded-xl border-0",
                      `bg-gradient-to-r ${action.color} text-white hover:opacity-90`
                    )}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area - Enhanced with voice */}
            <div className="p-3 border-t border-primary/20 bg-card flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-xl border-primary/30 bg-muted/50 focus:border-primary"
                disabled={isTyping}
                rows={1}
              />
              <div className="flex gap-1">
                <Button
                  onClick={handleVoiceInput}
                  size="icon"
                  variant="outline"
                  disabled={isTyping}
                  className={cn(
                    "rounded-xl border-primary/30",
                    isListening && "bg-red-500 border-red-500 text-white animate-pulse"
                  )}
                  title="Voice input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button 
                  onClick={() => handleSend()} 
                  size="icon"
                  disabled={isTyping || !input.trim()}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button with animated gradient */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl relative',
          'hover:shadow-3xl transition-shadow'
        )}
        style={{
          background: 'linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(280 75% 50%) 50%, hsl(330 80% 55%) 100%)',
          boxShadow: '0 0 50px hsl(262 83% 58% / 0.4)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated ring */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-2xl animate-ping opacity-20" 
              style={{ background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(330 80% 55%))' }} 
            />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center animate-pulse">
              <span className="text-[8px] text-white font-bold">1</span>
            </span>
          </>
        )}
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <ChevronDown className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}