import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'bn' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; nativeName: string }[];
}

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    'app.title': 'FloodGuard',
    'app.subtitle': 'Urban Flood Intelligence System',
    'nav.checkRisk': 'Check Risk',
    'nav.liveMap': 'Live Map',
    'nav.emergency': 'Emergency',
    'nav.authorityPortal': 'Authority Portal',
    
    // Hero Section
    'hero.badge': 'Official Government Platform',
    'hero.title1': 'Real-Time',
    'hero.title2': 'Flood Intelligence System',
    'hero.subtitle': 'Check flood risk instantly. Receive real-time alerts. Access emergency services.',
    'hero.noRegistration': 'No registration required for citizens.',
    
    // Stats
    'stats.monitoring': 'Monitoring',
    'stats.agencies': 'Agencies Connected',
    'stats.responseTime': 'Response Time',
    'stats.alertsSent': 'Alerts Sent',
    
    // Features
    'feature.realTimeMonitoring': 'Real-Time Monitoring',
    'feature.realTimeMonitoringDesc': 'Live flood status with satellite data',
    'feature.smartAlerts': 'Smart Alerts',
    'feature.smartAlertsDesc': 'Automatic emergency notifications',
    'feature.safeRoutes': 'Safe Routes',
    'feature.safeRoutesDesc': 'AI-powered evacuation guidance',
    'feature.coordinatedResponse': 'Coordinated Response',
    'feature.coordinatedResponseDesc': 'All agencies on one platform',
    
    // Location Search
    'search.placeholder': 'Search your location...',
    'search.useCurrentLocation': 'Use current location',
    
    // Risk Display
    'risk.safetyInstructions': 'Safety Instructions',
    'risk.low': 'Low Risk',
    'risk.medium': 'Medium Risk',
    'risk.high': 'High Risk',
    'risk.critical': 'Critical Risk',
    
    // Live Intelligence
    'intelligence.title': 'Real-Time Safety Tools',
    'intelligence.subtitle': 'Stay informed and keep your family safe',
    'intelligence.badge': 'Live Intelligence',
    
    // Map
    'map.title': 'Live Flood Intelligence Map',
    'map.subtitle': 'View flood zones, emergency services, shelters, and safe evacuation routes',
    'map.reportFlooding': 'Report Flooding',
    
    // Emergency
    'emergency.title': 'Emergency Services',
    'emergency.subtitle': 'One-tap access to all emergency responders',
    'emergency.available': '24/7 Available',
    'emergency.sosHelp': 'Need immediate help? Send an SOS signal to alert all nearby emergency responders.',
    'emergency.locationShared': 'Your location will be shared with emergency services',
    
    // Emergency Services
    'service.police': 'Police Control',
    'service.policeDesc': 'Law enforcement',
    'service.medical': 'Medical Emergency',
    'service.medicalDesc': 'Ambulance service',
    'service.fire': 'Fire & Rescue',
    'service.fireDesc': 'Fire department',
    'service.disaster': 'Disaster Helpline',
    'service.disasterDesc': 'NDMA helpline',
    
    // Buttons
    'btn.sos': 'SOS',
    'btn.directions': 'Directions',
    'btn.call': 'Call',
    'btn.login': 'Login',
    'btn.register': 'Register',
    
    // Emergency Contacts
    'contacts.title': 'Emergency Contacts',
    'contacts.subtitle': 'Quick dial your personal contacts',
    'contacts.add': 'Add Contact',
    'contacts.name': 'Name',
    'contacts.phone': 'Phone Number',
    'contacts.relationship': 'Relationship',
    
    // Weather Alerts
    'weather.alerts': 'Weather Alerts',
    'weather.noAlerts': 'No active alerts',
    'weather.severe': 'Severe Weather Warning',
    'weather.rainfall': 'Heavy Rainfall Expected',
    
    // Offline Mode
    'offline.title': 'Offline Mode',
    'offline.available': 'Offline data available',
    'offline.unavailable': 'Connect to internet for latest data',
    'offline.lastSync': 'Last synced',
  },
  hi: {
    // Header & Navigation
    'app.title': 'फ्लडगार्ड',
    'app.subtitle': 'शहरी बाढ़ खुफिया प्रणाली',
    'nav.checkRisk': 'जोखिम जांचें',
    'nav.liveMap': 'लाइव मैप',
    'nav.emergency': 'आपातकाल',
    'nav.authorityPortal': 'प्राधिकरण पोर्टल',
    
    // Hero Section
    'hero.badge': 'आधिकारिक सरकारी मंच',
    'hero.title1': 'रियल-टाइम',
    'hero.title2': 'बाढ़ खुफिया प्रणाली',
    'hero.subtitle': 'तुरंत बाढ़ जोखिम जांचें। रियल-टाइम अलर्ट प्राप्त करें। आपातकालीन सेवाओं तक पहुंचें।',
    'hero.noRegistration': 'नागरिकों के लिए पंजीकरण आवश्यक नहीं।',
    
    // Stats
    'stats.monitoring': 'निगरानी',
    'stats.agencies': 'जुड़ी एजेंसियां',
    'stats.responseTime': 'प्रतिक्रिया समय',
    'stats.alertsSent': 'भेजे गए अलर्ट',
    
    // Features
    'feature.realTimeMonitoring': 'रियल-टाइम निगरानी',
    'feature.realTimeMonitoringDesc': 'उपग्रह डेटा के साथ लाइव बाढ़ स्थिति',
    'feature.smartAlerts': 'स्मार्ट अलर्ट',
    'feature.smartAlertsDesc': 'स्वचालित आपातकालीन सूचनाएं',
    'feature.safeRoutes': 'सुरक्षित मार्ग',
    'feature.safeRoutesDesc': 'AI-संचालित निकासी मार्गदर्शन',
    'feature.coordinatedResponse': 'समन्वित प्रतिक्रिया',
    'feature.coordinatedResponseDesc': 'सभी एजेंसियां एक मंच पर',
    
    // Location Search
    'search.placeholder': 'अपना स्थान खोजें...',
    'search.useCurrentLocation': 'वर्तमान स्थान का उपयोग करें',
    
    // Risk Display
    'risk.safetyInstructions': 'सुरक्षा निर्देश',
    'risk.low': 'कम जोखिम',
    'risk.medium': 'मध्यम जोखिम',
    'risk.high': 'उच्च जोखिम',
    'risk.critical': 'गंभीर जोखिम',
    
    // Live Intelligence
    'intelligence.title': 'रियल-टाइम सुरक्षा उपकरण',
    'intelligence.subtitle': 'सूचित रहें और अपने परिवार को सुरक्षित रखें',
    'intelligence.badge': 'लाइव इंटेलिजेंस',
    
    // Map
    'map.title': 'लाइव बाढ़ खुफिया मैप',
    'map.subtitle': 'बाढ़ क्षेत्र, आपातकालीन सेवाएं, आश्रय और सुरक्षित निकासी मार्ग देखें',
    'map.reportFlooding': 'बाढ़ की रिपोर्ट करें',
    
    // Emergency
    'emergency.title': 'आपातकालीन सेवाएं',
    'emergency.subtitle': 'सभी आपातकालीन प्रतिक्रियाकर्ताओं तक एक-टैप पहुंच',
    'emergency.available': '24/7 उपलब्ध',
    'emergency.sosHelp': 'तत्काल मदद चाहिए? सभी नजदीकी आपातकालीन प्रतिक्रियाकर्ताओं को सचेत करने के लिए SOS सिग्नल भेजें।',
    'emergency.locationShared': 'आपका स्थान आपातकालीन सेवाओं के साथ साझा किया जाएगा',
    
    // Emergency Services
    'service.police': 'पुलिस नियंत्रण',
    'service.policeDesc': 'कानून प्रवर्तन',
    'service.medical': 'चिकित्सा आपातकाल',
    'service.medicalDesc': 'एम्बुलेंस सेवा',
    'service.fire': 'अग्नि और बचाव',
    'service.fireDesc': 'अग्निशमन विभाग',
    'service.disaster': 'आपदा हेल्पलाइन',
    'service.disasterDesc': 'NDMA हेल्पलाइन',
    
    // Buttons
    'btn.sos': 'SOS',
    'btn.directions': 'दिशाएं',
    'btn.call': 'कॉल करें',
    'btn.login': 'लॉगिन',
    'btn.register': 'पंजीकरण',
    
    // Emergency Contacts
    'contacts.title': 'आपातकालीन संपर्क',
    'contacts.subtitle': 'अपने व्यक्तिगत संपर्कों को त्वरित डायल करें',
    'contacts.add': 'संपर्क जोड़ें',
    'contacts.name': 'नाम',
    'contacts.phone': 'फ़ोन नंबर',
    'contacts.relationship': 'संबंध',
    
    // Weather Alerts
    'weather.alerts': 'मौसम अलर्ट',
    'weather.noAlerts': 'कोई सक्रिय अलर्ट नहीं',
    'weather.severe': 'गंभीर मौसम चेतावनी',
    'weather.rainfall': 'भारी वर्षा की उम्मीद',
    
    // Offline Mode
    'offline.title': 'ऑफ़लाइन मोड',
    'offline.available': 'ऑफ़लाइन डेटा उपलब्ध',
    'offline.unavailable': 'नवीनतम डेटा के लिए इंटरनेट से कनेक्ट करें',
    'offline.lastSync': 'अंतिम सिंक',
  },
  ta: {
    // Header & Navigation
    'app.title': 'ஃப்ளட்கார்ட்',
    'app.subtitle': 'நகர்ப்புற வெள்ள நுண்ணறிவு அமைப்பு',
    'nav.checkRisk': 'ஆபத்தை சரிபார்க்கவும்',
    'nav.liveMap': 'நேரடி வரைபடம்',
    'nav.emergency': 'அவசரநிலை',
    'nav.authorityPortal': 'அதிகாரி போர்டல்',
    
    // Hero Section
    'hero.badge': 'அதிகாரப்பூர்வ அரசு தளம்',
    'hero.title1': 'நிகழ்நேர',
    'hero.title2': 'வெள்ள நுண்ணறிவு அமைப்பு',
    'hero.subtitle': 'உடனடியாக வெள்ள ஆபத்தை சரிபார்க்கவும். நிகழ்நேர எச்சரிக்கைகளைப் பெறுங்கள். அவசர சேவைகளை அணுகுங்கள்.',
    'hero.noRegistration': 'குடிமக்களுக்கு பதிவு தேவையில்லை.',
    
    // Stats
    'stats.monitoring': 'கண்காணிப்பு',
    'stats.agencies': 'இணைக்கப்பட்ட நிறுவனங்கள்',
    'stats.responseTime': 'பதில் நேரம்',
    'stats.alertsSent': 'அனுப்பப்பட்ட எச்சரிக்கைகள்',
    
    // Features
    'feature.realTimeMonitoring': 'நிகழ்நேர கண்காணிப்பு',
    'feature.realTimeMonitoringDesc': 'செயற்கைக்கோள் தரவுடன் நேரடி வெள்ள நிலை',
    'feature.smartAlerts': 'ஸ்மார்ட் எச்சரிக்கைகள்',
    'feature.smartAlertsDesc': 'தானியங்கி அவசர அறிவிப்புகள்',
    'feature.safeRoutes': 'பாதுகாப்பான வழிகள்',
    'feature.safeRoutesDesc': 'AI-இயக்கப்படும் வெளியேற்ற வழிகாட்டுதல்',
    'feature.coordinatedResponse': 'ஒருங்கிணைந்த பதில்',
    'feature.coordinatedResponseDesc': 'எல்லா நிறுவனங்களும் ஒரே தளத்தில்',
    
    // Location Search
    'search.placeholder': 'உங்கள் இருப்பிடத்தைத் தேடுங்கள்...',
    'search.useCurrentLocation': 'தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்',
    
    // Risk Display
    'risk.safetyInstructions': 'பாதுகாப்பு அறிவுறுத்தல்கள்',
    'risk.low': 'குறைந்த ஆபத்து',
    'risk.medium': 'நடுத்தர ஆபத்து',
    'risk.high': 'அதிக ஆபத்து',
    'risk.critical': 'தீவிர ஆபத்து',
    
    // Live Intelligence
    'intelligence.title': 'நிகழ்நேர பாதுகாப்பு கருவிகள்',
    'intelligence.subtitle': 'தகவல் பெற்றிருங்கள் மற்றும் உங்கள் குடும்பத்தை பாதுகாப்பாக வைத்திருங்கள்',
    'intelligence.badge': 'நேரடி நுண்ணறிவு',
    
    // Map
    'map.title': 'நேரடி வெள்ள நுண்ணறிவு வரைபடம்',
    'map.subtitle': 'வெள்ள மண்டலங்கள், அவசர சேவைகள், தங்குமிடங்கள் மற்றும் பாதுகாப்பான வெளியேற்ற வழிகளைக் காணுங்கள்',
    'map.reportFlooding': 'வெள்ளத்தை புகாரளிக்கவும்',
    
    // Emergency
    'emergency.title': 'அவசர சேவைகள்',
    'emergency.subtitle': 'அனைத்து அவசர பதிலளிப்பாளர்களுக்கும் ஒரு-தட்டு அணுகல்',
    'emergency.available': '24/7 கிடைக்கும்',
    'emergency.sosHelp': 'உடனடி உதவி தேவையா? அருகிலுள்ள அனைத்து அவசர பதிலளிப்பாளர்களையும் எச்சரிக்க SOS சிக்னல் அனுப்புங்கள்.',
    'emergency.locationShared': 'உங்கள் இருப்பிடம் அவசர சேவைகளுடன் பகிரப்படும்',
    
    // Emergency Services
    'service.police': 'காவல் கட்டுப்பாடு',
    'service.policeDesc': 'சட்ட அமலாக்கம்',
    'service.medical': 'மருத்துவ அவசரநிலை',
    'service.medicalDesc': 'ஆம்புலன்ஸ் சேவை',
    'service.fire': 'தீ & மீட்பு',
    'service.fireDesc': 'தீயணைப்பு துறை',
    'service.disaster': 'பேரிடர் ஹெல்ப்லைன்',
    'service.disasterDesc': 'NDMA ஹெல்ப்லைன்',
    
    // Buttons
    'btn.sos': 'SOS',
    'btn.directions': 'திசைகள்',
    'btn.call': 'அழைக்கவும்',
    'btn.login': 'உள்நுழை',
    'btn.register': 'பதிவு செய்க',
    
    // Emergency Contacts
    'contacts.title': 'அவசர தொடர்புகள்',
    'contacts.subtitle': 'உங்கள் தனிப்பட்ட தொடர்புகளை விரைவாக டயல் செய்யுங்கள்',
    'contacts.add': 'தொடர்பு சேர்க்கவும்',
    'contacts.name': 'பெயர்',
    'contacts.phone': 'தொலைபேசி எண்',
    'contacts.relationship': 'உறவு',
    
    // Weather Alerts
    'weather.alerts': 'வானிலை எச்சரிக்கைகள்',
    'weather.noAlerts': 'செயலில் எச்சரிக்கைகள் இல்லை',
    'weather.severe': 'கடுமையான வானிலை எச்சரிக்கை',
    'weather.rainfall': 'கனமழை எதிர்பார்க்கப்படுகிறது',
    
    // Offline Mode
    'offline.title': 'ஆஃப்லைன் பயன்முறை',
    'offline.available': 'ஆஃப்லைன் தரவு கிடைக்கிறது',
    'offline.unavailable': 'சமீபத்திய தரவுக்கு இணையத்துடன் இணைக்கவும்',
    'offline.lastSync': 'கடைசியாக ஒத்திசைக்கப்பட்டது',
  },
  bn: {
    // Header & Navigation
    'app.title': 'ফ্লাডগার্ড',
    'app.subtitle': 'শহুরে বন্যা বুদ্ধিমত্তা সিস্টেম',
    'nav.checkRisk': 'ঝুঁকি পরীক্ষা করুন',
    'nav.liveMap': 'লাইভ ম্যাপ',
    'nav.emergency': 'জরুরি',
    'nav.authorityPortal': 'কর্তৃপক্ষ পোর্টাল',
    
    // Hero Section
    'hero.badge': 'অফিসিয়াল সরকারি প্ল্যাটফর্ম',
    'hero.title1': 'রিয়েল-টাইম',
    'hero.title2': 'বন্যা বুদ্ধিমত্তা সিস্টেম',
    'hero.subtitle': 'তাৎক্ষণিকভাবে বন্যার ঝুঁকি পরীক্ষা করুন। রিয়েল-টাইম সতর্কতা পান। জরুরি সেবা অ্যাক্সেস করুন।',
    'hero.noRegistration': 'নাগরিকদের জন্য নিবন্ধন প্রয়োজন নেই।',
    
    // Stats
    'stats.monitoring': 'পর্যবেক্ষণ',
    'stats.agencies': 'সংযুক্ত সংস্থা',
    'stats.responseTime': 'প্রতিক্রিয়া সময়',
    'stats.alertsSent': 'পাঠানো সতর্কতা',
    
    // Features
    'feature.realTimeMonitoring': 'রিয়েল-টাইম পর্যবেক্ষণ',
    'feature.realTimeMonitoringDesc': 'স্যাটেলাইট ডেটা সহ লাইভ বন্যার অবস্থা',
    'feature.smartAlerts': 'স্মার্ট সতর্কতা',
    'feature.smartAlertsDesc': 'স্বয়ংক্রিয় জরুরি বিজ্ঞপ্তি',
    'feature.safeRoutes': 'নিরাপদ রুট',
    'feature.safeRoutesDesc': 'AI-চালিত সরিয়ে নেওয়ার নির্দেশনা',
    'feature.coordinatedResponse': 'সমন্বিত প্রতিক্রিয়া',
    'feature.coordinatedResponseDesc': 'সমস্ত সংস্থা একটি প্ল্যাটফর্মে',
    
    // Location Search
    'search.placeholder': 'আপনার অবস্থান খুঁজুন...',
    'search.useCurrentLocation': 'বর্তমান অবস্থান ব্যবহার করুন',
    
    // Risk Display
    'risk.safetyInstructions': 'নিরাপত্তা নির্দেশাবলী',
    'risk.low': 'কম ঝুঁকি',
    'risk.medium': 'মাঝারি ঝুঁকি',
    'risk.high': 'উচ্চ ঝুঁকি',
    'risk.critical': 'গুরুতর ঝুঁকি',
    
    // Live Intelligence
    'intelligence.title': 'রিয়েল-টাইম নিরাপত্তা সরঞ্জাম',
    'intelligence.subtitle': 'অবগত থাকুন এবং আপনার পরিবারকে নিরাপদ রাখুন',
    'intelligence.badge': 'লাইভ ইন্টেলিজেন্স',
    
    // Map
    'map.title': 'লাইভ বন্যা বুদ্ধিমত্তা ম্যাপ',
    'map.subtitle': 'বন্যা অঞ্চল, জরুরি সেবা, আশ্রয়স্থল এবং নিরাপদ সরিয়ে নেওয়ার রুট দেখুন',
    'map.reportFlooding': 'বন্যার রিপোর্ট করুন',
    
    // Emergency
    'emergency.title': 'জরুরি সেবা',
    'emergency.subtitle': 'সমস্ত জরুরি প্রতিক্রিয়াকারীদের এক-ট্যাপ অ্যাক্সেস',
    'emergency.available': '২৪/৭ উপলব্ধ',
    'emergency.sosHelp': 'তাৎক্ষণিক সাহায্য প্রয়োজন? কাছাকাছি সমস্ত জরুরি প্রতিক্রিয়াকারীদের সতর্ক করতে SOS সংকেত পাঠান।',
    'emergency.locationShared': 'আপনার অবস্থান জরুরি সেবার সাথে শেয়ার করা হবে',
    
    // Emergency Services
    'service.police': 'পুলিশ নিয়ন্ত্রণ',
    'service.policeDesc': 'আইন প্রয়োগ',
    'service.medical': 'চিকিৎসা জরুরি',
    'service.medicalDesc': 'অ্যাম্বুলেন্স সেবা',
    'service.fire': 'আগুন ও উদ্ধার',
    'service.fireDesc': 'ফায়ার বিভাগ',
    'service.disaster': 'দুর্যোগ হেল্পলাইন',
    'service.disasterDesc': 'NDMA হেল্পলাইন',
    
    // Buttons
    'btn.sos': 'SOS',
    'btn.directions': 'দিকনির্দেশ',
    'btn.call': 'কল করুন',
    'btn.login': 'লগইন',
    'btn.register': 'নিবন্ধন',
    
    // Emergency Contacts
    'contacts.title': 'জরুরি পরিচিতি',
    'contacts.subtitle': 'আপনার ব্যক্তিগত পরিচিতিগুলি দ্রুত ডায়াল করুন',
    'contacts.add': 'পরিচিতি যোগ করুন',
    'contacts.name': 'নাম',
    'contacts.phone': 'ফোন নম্বর',
    'contacts.relationship': 'সম্পর্ক',
    
    // Weather Alerts
    'weather.alerts': 'আবহাওয়া সতর্কতা',
    'weather.noAlerts': 'কোন সক্রিয় সতর্কতা নেই',
    'weather.severe': 'গুরুতর আবহাওয়া সতর্কতা',
    'weather.rainfall': 'ভারী বৃষ্টিপাত প্রত্যাশিত',
    
    // Offline Mode
    'offline.title': 'অফলাইন মোড',
    'offline.available': 'অফলাইন ডেটা উপলব্ধ',
    'offline.unavailable': 'সর্বশেষ ডেটার জন্য ইন্টারনেটে সংযোগ করুন',
    'offline.lastSync': 'শেষ সিঙ্ক',
  },
  mr: {
    // Header & Navigation
    'app.title': 'फ्लडगार्ड',
    'app.subtitle': 'शहरी पूर बुद्धिमत्ता प्रणाली',
    'nav.checkRisk': 'धोका तपासा',
    'nav.liveMap': 'लाइव्ह नकाशा',
    'nav.emergency': 'आणीबाणी',
    'nav.authorityPortal': 'प्राधिकरण पोर्टल',
    
    // Hero Section
    'hero.badge': 'अधिकृत सरकारी व्यासपीठ',
    'hero.title1': 'रिअल-टाइम',
    'hero.title2': 'पूर बुद्धिमत्ता प्रणाली',
    'hero.subtitle': 'लगेच पूर धोका तपासा. रिअल-टाइम अलर्ट मिळवा. आणीबाणी सेवा वापरा.',
    'hero.noRegistration': 'नागरिकांसाठी नोंदणी आवश्यक नाही.',
    
    // Stats
    'stats.monitoring': 'निरीक्षण',
    'stats.agencies': 'जोडलेल्या संस्था',
    'stats.responseTime': 'प्रतिसाद वेळ',
    'stats.alertsSent': 'पाठवलेले अलर्ट',
    
    // Features
    'feature.realTimeMonitoring': 'रिअल-टाइम निरीक्षण',
    'feature.realTimeMonitoringDesc': 'उपग्रह डेटासह लाइव्ह पूर स्थिती',
    'feature.smartAlerts': 'स्मार्ट अलर्ट',
    'feature.smartAlertsDesc': 'स्वयंचलित आणीबाणी सूचना',
    'feature.safeRoutes': 'सुरक्षित मार्ग',
    'feature.safeRoutesDesc': 'AI-चालित स्थलांतर मार्गदर्शन',
    'feature.coordinatedResponse': 'समन्वित प्रतिसाद',
    'feature.coordinatedResponseDesc': 'सर्व संस्था एका व्यासपीठावर',
    
    // Location Search
    'search.placeholder': 'तुमचे स्थान शोधा...',
    'search.useCurrentLocation': 'सध्याचे स्थान वापरा',
    
    // Risk Display
    'risk.safetyInstructions': 'सुरक्षा सूचना',
    'risk.low': 'कमी धोका',
    'risk.medium': 'मध्यम धोका',
    'risk.high': 'उच्च धोका',
    'risk.critical': 'गंभीर धोका',
    
    // Live Intelligence
    'intelligence.title': 'रिअल-टाइम सुरक्षा साधने',
    'intelligence.subtitle': 'माहिती घ्या आणि तुमच्या कुटुंबाला सुरक्षित ठेवा',
    'intelligence.badge': 'लाइव्ह इंटेलिजन्स',
    
    // Map
    'map.title': 'लाइव्ह पूर बुद्धिमत्ता नकाशा',
    'map.subtitle': 'पूर क्षेत्रे, आणीबाणी सेवा, आश्रयस्थाने आणि सुरक्षित स्थलांतर मार्ग पहा',
    'map.reportFlooding': 'पुराची माहिती द्या',
    
    // Emergency
    'emergency.title': 'आणीबाणी सेवा',
    'emergency.subtitle': 'सर्व आणीबाणी प्रतिसादकांना एक-टॅप प्रवेश',
    'emergency.available': '२४/७ उपलब्ध',
    'emergency.sosHelp': 'तात्काळ मदत हवी? जवळपासच्या सर्व आणीबाणी प्रतिसादकांना सूचित करण्यासाठी SOS सिग्नल पाठवा.',
    'emergency.locationShared': 'तुमचे स्थान आणीबाणी सेवांसह शेअर केले जाईल',
    
    // Emergency Services
    'service.police': 'पोलीस नियंत्रण',
    'service.policeDesc': 'कायदा अंमलबजावणी',
    'service.medical': 'वैद्यकीय आणीबाणी',
    'service.medicalDesc': 'रुग्णवाहिका सेवा',
    'service.fire': 'अग्नि आणि बचाव',
    'service.fireDesc': 'अग्निशमन विभाग',
    'service.disaster': 'आपत्ती हेल्पलाइन',
    'service.disasterDesc': 'NDMA हेल्पलाइन',
    
    // Buttons
    'btn.sos': 'SOS',
    'btn.directions': 'दिशा',
    'btn.call': 'कॉल करा',
    'btn.login': 'लॉगिन',
    'btn.register': 'नोंदणी',
    
    // Emergency Contacts
    'contacts.title': 'आणीबाणी संपर्क',
    'contacts.subtitle': 'तुमच्या वैयक्तिक संपर्कांना त्वरित डायल करा',
    'contacts.add': 'संपर्क जोडा',
    'contacts.name': 'नाव',
    'contacts.phone': 'फोन नंबर',
    'contacts.relationship': 'नाते',
    
    // Weather Alerts
    'weather.alerts': 'हवामान अलर्ट',
    'weather.noAlerts': 'कोणतेही सक्रिय अलर्ट नाहीत',
    'weather.severe': 'गंभीर हवामान चेतावणी',
    'weather.rainfall': 'जोरदार पावसाची अपेक्षा',
    
    // Offline Mode
    'offline.title': 'ऑफलाइन मोड',
    'offline.available': 'ऑफलाइन डेटा उपलब्ध',
    'offline.unavailable': 'नवीनतम डेटासाठी इंटरनेटशी कनेक्ट करा',
    'offline.lastSync': 'शेवटचे सिंक',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-language') as Language;
      return saved && languages.some(l => l.code === saved) ? saved : 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
