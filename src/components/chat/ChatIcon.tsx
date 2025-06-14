import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatIconProps {
  messageCount: number;
  timeRemaining: string;
  isExpired: boolean;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

const ChatIcon = ({
  messageCount,
  timeRemaining,
  isExpired,
  isActive = false,
  onClick,
  className,
}: ChatIconProps) => {
  // Chat is never expired now, always available

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("relative", className)}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 w-10 md:h-8 md:w-8 p-0 transition-all duration-300 hover:scale-110 border border-transparent rounded-xl touch-manipulation",
                isActive
                  ? "text-neon-green bg-neon-green/20 border-neon-green/50 shadow-neon animate-pulse-glow"
                  : "text-gray-400 hover:text-neon-green hover:bg-neon-green/10 hover:border-neon-green/50 hover:shadow-neon",
              )}
              onClick={onClick}
            >
              <MessageCircle className="h-5 w-5 md:h-4 md:w-4" />
            </Button>

            {/* Message count badge */}
            {messageCount > 0 && (
              <Badge
                className={cn(
                  "absolute -top-2 -right-2 h-6 w-6 md:h-5 md:w-5 p-0 flex items-center justify-center text-xs font-bold font-mono border-2 border-neon-dark transition-all duration-300",
                  isActive
                    ? "bg-neon-green text-black animate-pulse"
                    : "bg-neon-green/80 text-black hover:bg-neon-green",
                )}
              >
                {messageCount > 99 ? "99+" : messageCount}
              </Badge>
            )}

            {/* Active indicator */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl border border-neon-green/30 animate-ping" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-neon-dark border-neon-green/50 text-neon-green font-mono">
          <div className="space-y-1">
            <p className="text-xs font-bold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Ephemeral Chat
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <MessageCircle className="h-3 w-3" />
              <span>Always Available</span>
            </div>
            {messageCount > 0 && (
              <p className="text-xs text-neon-green">
                {messageCount} message{messageCount !== 1 ? "s" : ""}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Messages auto-delete after 16h
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ChatIcon;
