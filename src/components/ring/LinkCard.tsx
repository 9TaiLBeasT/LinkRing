import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExternalLink, MessageCircle, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { SharedLink } from "@/hooks/useRingData";
import { formatDistanceToNow } from "date-fns";
import EmbedPlayer from "@/components/ui/embed-player";
import {
  getPlatformDisplayName,
  getPlatformIcon,
  EmbedType,
} from "@/lib/embedUtils";
import ChatIcon from "@/components/chat/ChatIcon";
import ChatPanel from "@/components/chat/ChatPanel";
import { useLinkChat } from "@/hooks/useLinkChat";

interface LinkCardProps {
  link: SharedLink;
  className?: string;
}

const REACTIONS = [
  {
    emoji: "❤️",
    name: "love",
    color: "text-red-400",
    hoverColor: "hover:bg-red-500/20",
  },
  {
    emoji: "🔥",
    name: "fire",
    color: "text-orange-400",
    hoverColor: "hover:bg-orange-500/20",
  },
  {
    emoji: "😂",
    name: "laugh",
    color: "text-yellow-400",
    hoverColor: "hover:bg-yellow-500/20",
  },
  {
    emoji: "👀",
    name: "eyes",
    color: "text-blue-400",
    hoverColor: "hover:bg-blue-500/20",
  },
];

const LinkCard = ({ link, className }: LinkCardProps) => {
  // Initialize with more realistic reaction counts
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    love: Math.floor(Math.random() * 5) + 1,
    fire: Math.floor(Math.random() * 3) + 1,
    laugh: Math.floor(Math.random() * 2) + 1,
    eyes: Math.floor(Math.random() * 4) + 1,
  });
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Chat functionality
  const {
    messages,
    isExpired: isChatExpired,
    timeRemainingFormatted,
  } = useLinkChat({
    linkId: link.id,
    linkCreatedAt: link.created_at,
  });

  // Drop animation effect for new cards
  useEffect(() => {
    setJustAdded(true);
    const timer = setTimeout(() => setJustAdded(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const getDomainName = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "Unknown";
    }
  };

  const handleReaction = (reactionName: string) => {
    setIsAnimating(true);

    if (userReactions.has(reactionName)) {
      // Remove reaction
      setUserReactions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reactionName);
        return newSet;
      });
      setReactionCounts((prev) => ({
        ...prev,
        [reactionName]: Math.max(0, prev[reactionName] - 1),
      }));
    } else {
      // Add reaction
      setUserReactions((prev) => new Set([...prev, reactionName]));
      setReactionCounts((prev) => ({
        ...prev,
        [reactionName]: prev[reactionName] + 1,
      }));
    }

    setTimeout(() => setIsAnimating(false), 600);
  };

  const userName = link.user_name || "Anonymous";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AN";

  return (
    <Card
      className={cn(
        "cyber-card group hover:border-neon-green/60 transition-all duration-500 relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-neon-dark/95 to-neon-gray/90 border-2",
        justAdded && "animate-flicker-in",
        className,
      )}
    >
      {/* Enhanced Glow effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <CardContent className="p-4 md:p-6 space-y-4 relative z-10">
        {/* Embedded Content */}
        {link.embed_type && link.embed_data && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="border-blue-500/40 text-blue-400 font-mono text-xs"
              >
                {getPlatformIcon(link.embed_type as EmbedType)}{" "}
                {getPlatformDisplayName(link.embed_type as EmbedType)}
              </Badge>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
            </div>
            <EmbedPlayer
              embedData={{
                ...link.embed_data,
                type: link.embed_type,
                originalUrl: link.url,
              }}
              className="w-full"
              autoPlay={false}
              showControls={true}
              onError={(error) => {
                console.error("Embed player error:", error);
              }}
            />
          </div>
        )}

        {/* Enhanced Link Preview */}
        <div className="flex items-start gap-3 md:gap-4">
          <div className="shrink-0 relative">
            {getFaviconUrl(link.url) ? (
              <div className="relative group/favicon">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-green/30 to-blue-500/30 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <img
                  src={getFaviconUrl(link.url)!}
                  alt="Favicon"
                  className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-neon-green/40 group-hover:border-neon-green transition-all duration-300 group-hover:scale-110 shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ) : (
              <div className="relative group/favicon">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-green/30 to-blue-500/30 blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-neon-green/40 bg-gradient-to-br from-neon-gray/80 to-neon-dark/80 flex items-center justify-center group-hover:border-neon-green group-hover:shadow-neon transition-all duration-300 group-hover:scale-110">
                  <ExternalLink className="h-5 w-5 md:h-6 md:w-6 text-neon-green group-hover:animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-bold text-white text-lg md:text-xl truncate group-hover:text-neon-green transition-colors duration-300 font-mono leading-tight">
              {link.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <p className="text-sm text-gray-400 truncate font-mono">
                {getDomainName(link.url)}
              </p>
            </div>
            {link.description && (
              <p className="text-sm text-gray-300 mt-3 line-clamp-3 leading-relaxed bg-neon-gray/20 p-3 rounded-lg border border-neon-green/10">
                {link.description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-gray-400 hover:text-neon-green hover:bg-neon-green/20 transition-all duration-300 hover:scale-110 border border-transparent hover:border-neon-green/50 rounded-xl h-10 w-10 md:h-8 md:w-8 p-0 touch-manipulation"
            onClick={() => window.open(link.url, "_blank")}
          >
            <ExternalLink className="h-5 w-5 md:h-5 md:w-5" />
          </Button>
        </div>

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {link.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className={cn(
                  "text-xs border-neon-green/40 text-neon-green hover:border-neon-green hover:shadow-neon transition-all duration-300 font-mono animate-flicker-in",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Enhanced Reactions and User Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gradient-to-r from-neon-green/20 via-neon-green/10 to-transparent gap-3 sm:gap-0">
          {/* Glowing Reaction Buttons */}
          <div className="flex items-center gap-1 flex-wrap">
            {REACTIONS.map((reaction, index) => {
              const count = reactionCounts[reaction.name];
              const isActive = userReactions.has(reaction.name);

              return (
                <TooltipProvider key={reaction.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-10 md:h-11 px-3 md:px-4 transition-all duration-300 hover:scale-125 relative group/reaction border-2 border-transparent rounded-xl backdrop-blur-sm touch-manipulation",
                          isActive
                            ? "bg-gradient-to-r from-neon-green/30 to-neon-green/20 border-neon-green/80 shadow-neon-lg animate-pulse-glow"
                            : "hover:bg-gradient-to-r hover:from-neon-green/20 hover:to-neon-green/10 hover:border-neon-green/50 hover:shadow-neon",
                          reaction.hoverColor,
                          isAnimating && isActive && "animate-bounce",
                        )}
                        onClick={() => handleReaction(reaction.name)}
                      >
                        <span className="text-base md:text-lg mr-1 group-hover/reaction:animate-bounce">
                          {reaction.emoji}
                        </span>
                        {count > 0 && (
                          <span
                            className={cn(
                              "text-xs font-bold font-mono transition-all duration-300",
                              isActive ? "text-neon-green" : "text-gray-400",
                              isAnimating &&
                                isActive &&
                                "animate-counter-up scale-125",
                            )}
                          >
                            {count}
                          </span>
                        )}
                        {/* Pulse effect for active reactions */}
                        {isActive && (
                          <div className="absolute inset-0 rounded border border-neon-green/30 animate-ping" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-neon-dark border-neon-green/50 text-neon-green font-mono">
                      <p className="capitalize font-bold">{reaction.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Chat Icon */}
            <div className="flex-shrink-0">
              <ChatIcon
                messageCount={messages.length}
                timeRemaining={timeRemainingFormatted}
                isExpired={isChatExpired}
                isActive={isChatOpen}
                onClick={() => setIsChatOpen(true)}
                className="relative z-10"
              />
            </div>

            {/* Comment/Description Button */}
            {link.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 md:h-8 md:w-8 p-0 text-gray-400 hover:text-neon-green hover:bg-neon-green/10 transition-all duration-300 hover:scale-110 touch-manipulation"
                      onClick={() => {
                        alert(`Description: ${link.description}`);
                      }}
                    >
                      <MessageCircle className="h-5 w-5 md:h-4 md:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="max-w-xs bg-neon-dark border-neon-green/50 text-white"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-neon-green font-bold font-mono">
                        Click to view description
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* User Info */}
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-8 md:w-8 border-2 border-neon-green/40 hover:border-neon-green hover:shadow-neon transition-all duration-300">
                {link.avatar_url ? (
                  <AvatarImage src={link.avatar_url} alt={userName} />
                ) : null}
                <AvatarFallback className="text-xs bg-neon-gray text-neon-green font-bold font-mono">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-right space-y-1 hidden sm:block">
                <p className="text-sm text-neon-green font-bold font-mono hover:animate-pulse cursor-default">
                  {userName}
                </p>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-gray-500" />
                  <p className="text-xs text-gray-500 font-mono">
                    {formatDistanceToNow(new Date(link.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Chat Panel */}
      <ChatPanel
        linkId={link.id}
        linkTitle={link.title}
        linkCreatedAt={link.created_at}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </Card>
  );
};

export default LinkCard;
