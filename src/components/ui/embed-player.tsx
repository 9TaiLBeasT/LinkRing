import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  ExternalLink,
  AlertCircle,
  Loader2,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EmbedData,
  getPlatformDisplayName,
  getPlatformIcon,
} from "@/lib/embedUtils";

interface EmbedPlayerProps {
  embedData: EmbedData;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  compact?: boolean;
  onError?: (error: string) => void;
}

const EmbedPlayer: React.FC<EmbedPlayerProps> = ({
  embedData,
  className,
  autoPlay = false,
  showControls = true,
  compact = false,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.("Failed to load embedded content");
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const handleExternalClick = () => {
    window.open(embedData.originalUrl, "_blank", "noopener,noreferrer");
  };

  const getEmbedHeight = () => {
    if (compact) return "200px";

    switch (embedData.type) {
      case "youtube":
        return "315px"; // 16:9 aspect ratio
      case "twitter":
        return "400px";
      case "spotify":
        return embedData.id.startsWith("track/") ? "152px" : "352px";
      case "soundcloud":
        return "166px";
      case "codepen":
        return "400px";
      case "figma":
        return "450px";
      case "canva":
        return "400px";
      case "instagram":
        return "400px";
      case "tiktok":
        return "500px";
      case "pdf":
      case "docx":
      case "xlsx":
      case "pptx":
      case "google_docs":
        return "600px";
      case "notion":
        return "500px";
      case "github":
        return "400px";
      case "dribbble":
        return "400px";
      case "behance":
        return "400px";
      case "vimeo":
        return "315px";
      case "twitch":
        return "400px";
      default:
        return "400px";
    }
  };

  const renderThumbnail = () => {
    if (embedData.type === "youtube" && embedData.thumbnail) {
      return (
        <div
          className="relative group cursor-pointer"
          onClick={handlePlayClick}
        >
          <img
            src={embedData.thumbnail}
            alt={embedData.title || "Video thumbnail"}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              // Fallback to default thumbnail
              e.currentTarget.src = `https://img.youtube.com/vi/${embedData.id}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
            <div className="bg-red-600 hover:bg-red-700 transition-colors rounded-full p-4 group-hover:scale-110 transform duration-200">
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
              <h3 className="text-white font-semibold text-sm line-clamp-2">
                {embedData.title || "YouTube Video"}
              </h3>
              {embedData.author && (
                <p className="text-gray-300 text-xs mt-1">{embedData.author}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Generic preview for other platforms
    return (
      <div
        className="relative group cursor-pointer bg-gradient-to-br from-neon-green/10 to-blue-500/10 rounded-lg border border-neon-green/30 hover:border-neon-green/50 transition-all duration-300"
        onClick={handlePlayClick}
        style={{ height: getEmbedHeight() }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4 animate-pulse">
            {getPlatformIcon(embedData.type as any)}
          </div>
          <h3 className="text-neon-green font-bold text-lg mb-2">
            {getPlatformDisplayName(embedData.type as any)} Content
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            Click to load embedded content
          </p>
          <div className="bg-neon-green/20 hover:bg-neon-green/30 transition-colors rounded-full p-3 group-hover:scale-110 transform duration-200">
            <Play className="h-6 w-6 text-neon-green fill-neon-green ml-0.5" />
          </div>
        </div>
      </div>
    );
  };

  const renderEmbed = () => {
    if (!embedData.embedUrl) return null;

    return (
      <div className="relative w-full" style={{ height: getEmbedHeight() }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neon-gray/50 rounded-lg">
            <div className="flex items-center gap-2 text-neon-green">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-mono">Loading embed...</span>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={embedData.embedUrl}
          className={cn(
            "w-full h-full rounded-lg border-0",
            isLoading && "opacity-0",
          )}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          title={`${getPlatformDisplayName(embedData.type as any)} embed`}
        />
      </div>
    );
  };

  if (hasError) {
    return (
      <Card className={cn("bg-red-900/20 border-red-500/30", className)}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-300 font-semibold mb-2">
            Failed to Load Embed
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            The embedded content couldn't be loaded. You can still view it on
            the original site.
          </p>
          <Button
            onClick={handleExternalClick}
            className="neon-button"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Original
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden bg-neon-gray/20 border-neon-green/30",
        className,
      )}
    >
      <CardContent className="p-0">
        {/* Platform Badge */}
        <div className="flex items-center justify-between p-3 bg-neon-dark/50 border-b border-neon-green/20">
          <Badge
            variant="outline"
            className="border-neon-green/40 text-neon-green font-mono text-xs"
          >
            {getPlatformIcon(embedData.type as any)}{" "}
            {getPlatformDisplayName(embedData.type as any)}
          </Badge>

          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExternalClick}
                className="h-8 w-8 p-0 text-gray-400 hover:text-neon-green"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-neon-green"
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Embed Content */}
        <div className="p-3">
          {!isPlaying && !autoPlay ? renderThumbnail() : renderEmbed()}
        </div>
      </CardContent>
    </Card>
  );
};

// Responsive wrapper component
export const ResponsiveEmbedPlayer: React.FC<EmbedPlayerProps> = (props) => {
  return (
    <div className="w-full max-w-full">
      <div className="aspect-video md:aspect-auto">
        <EmbedPlayer {...props} />
      </div>
    </div>
  );
};

export default EmbedPlayer;
