import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  CheckCircle,
  Droplets,
  Image,
  Phone,
  XCircle,
  ExternalLink,
  Navigation,
  X,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CrowdReport } from '@/types/flood';
import { cn } from '@/lib/utils';

interface CrowdReportsListProps {
  reports: CrowdReport[];
  onVerify: (reportId: string, verified: boolean) => void;
}

interface ExtendedCrowdReport extends CrowdReport {
  imageUrls?: string[];
  address?: string;
  broadcastToAll?: boolean;
}

const waterLevelLabels: Record<string, { label: string; color: string; icon: string }> = {
  ankle: { label: 'Ankle Deep', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: '🦶' },
  knee: { label: 'Knee Deep', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30', icon: '🦵' },
  waist: { label: 'Waist Deep', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: '👤' },
  chest: { label: 'Chest Deep', color: 'bg-red-600/20 text-red-600 border-red-600/30', icon: '🧍' },
  above: { label: 'Impassable', color: 'bg-red-700/20 text-red-700 border-red-700/30', icon: '⚠️' },
};

// Image Gallery Modal
function ImageGalleryModal({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: { 
  images: string[]; 
  isOpen: boolean; 
  onClose: () => void;
  initialIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>

        <div 
          className="relative max-w-4xl w-full" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goPrev}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Image */}
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={images[currentIndex]}
            alt={`Flood report image ${currentIndex + 1}`}
            className="w-full max-h-[80vh] object-contain rounded-lg"
          />

          {/* Pagination dots */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === currentIndex ? "bg-white" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function CrowdReportsList({ reports, onVerify }: CrowdReportsListProps) {
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
  const unverifiedCount = reports.filter(r => !r.verified).length;

  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Citizen Flood Reports
          </CardTitle>
          <div className="flex gap-2">
            {unverifiedCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unverifiedCount} Pending
              </Badge>
            )}
            <Badge variant="secondary">{reports.length} Total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Droplets className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No flood reports</p>
              <p className="text-sm">Reports from citizens will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {(reports as ExtendedCrowdReport[]).map((report, index) => {
                const levelInfo = waterLevelLabels[report.waterLevel] || { 
                  label: report.waterLevel, 
                  color: 'bg-muted', 
                  icon: '💧' 
                };
                const images = report.imageUrls || (report.imageUrl ? [report.imageUrl] : []);
                
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      report.verified 
                        ? 'border-success/30 bg-success/5' 
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Image Thumbnail */}
                      {images.length > 0 && (
                        <div 
                          className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer group"
                          onClick={() => setSelectedImages(images)}
                        >
                          <img
                            src={images[0]}
                            alt="Flood report"
                            className="w-full h-full object-cover"
                          />
                          {images.length > 1 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold">+{images.length - 1}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                            <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={cn("border", levelInfo.color)}>
                            <span className="mr-1">{levelInfo.icon}</span>
                            {levelInfo.label}
                          </Badge>
                          {report.verified && (
                            <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {report.broadcastToAll && (
                            <Badge variant="outline" className="text-xs">
                              Broadcast
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm mb-2 line-clamp-2">
                          {report.description}
                        </p>

                        {/* Location */}
                        {report.address && (
                          <p className="text-sm text-muted-foreground mb-2 truncate">
                            📍 {report.address}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <button
                            onClick={() => openGoogleMaps(report.location.lat, report.location.lng)}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <MapPin className="w-3 h-3" />
                            View Location
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(report.timestamp)}
                          </span>
                          {report.reporterContact && (
                            <a 
                              href={`tel:${report.reporterContact}`} 
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              Call Reporter
                            </a>
                          )}
                          {images.length > 0 && (
                            <button
                              onClick={() => setSelectedImages(images)}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Image className="w-3 h-3" />
                              {images.length} Photo{images.length > 1 ? 's' : ''}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {!report.verified && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground gap-1"
                            onClick={() => onVerify(report.id, true)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                            onClick={() => onVerify(report.id, false)}
                          >
                            <XCircle className="w-4 h-4" />
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1"
                            onClick={() => openGoogleMaps(report.location.lat, report.location.lng)}
                          >
                            <Navigation className="w-4 h-4" />
                            Navigate
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Gallery Modal */}
      {selectedImages && (
        <ImageGalleryModal
          images={selectedImages}
          isOpen={!!selectedImages}
          onClose={() => setSelectedImages(null)}
        />
      )}
    </>
  );
}
