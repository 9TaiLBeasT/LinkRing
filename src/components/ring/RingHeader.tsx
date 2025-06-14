import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Crown,
  Users,
  Link as LinkIcon,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RingData, RingMember } from "@/hooks/useRingData";

interface RingHeaderProps {
  ring: RingData;
  members: RingMember[];
  linkCount: number;
  onCopyInvite: () => void;
  className?: string;
}

const RingHeader = ({
  ring,
  members,
  linkCount,
  onCopyInvite,
  className,
}: RingHeaderProps) => {
  const ownerMember = members.find((m) => m.role === "owner");
  const displayMembers = members.slice(0, 12); // Show max 12 avatars
  const remainingCount = Math.max(0, members.length - 12);

  return (
    <div
      className={cn(
        "bg-neon-dark/95 backdrop-blur-md border-b border-neon-green/20 p-4 md:p-6 animate-slide-in-left",
        className,
      )}
    >
      <div className="max-w-6xl mx-auto">
        {/* Ring Title and Stats */}
        <div className="flex flex-col lg:flex-row items-start justify-between mb-6 md:mb-8 gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <h1
                className="text-2xl md:text-4xl font-bold text-white font-mono glitch-text hover:animate-pulse transition-all duration-300"
                data-text={ring.name}
              >
                {ring.name}
              </h1>
              {ring.is_owner && (
                <div className="relative">
                  <Crown className="h-5 w-5 md:h-7 md:w-7 text-neon-green animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Crown className="h-5 w-5 md:h-7 md:w-7 text-neon-green opacity-30" />
                  </div>
                </div>
              )}
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-neon-green animate-bounce" />
            </div>

            {ring.description && (
              <p className="text-gray-300 max-w-2xl text-base md:text-lg leading-relaxed">
                {ring.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm">
              <div className="flex items-center gap-2 bg-neon-gray/30 px-3 py-1 rounded-full border border-neon-green/20">
                <Users className="h-4 w-4 text-neon-green" />
                <span className="text-white font-mono">
                  {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-neon-gray/30 px-3 py-1 rounded-full border border-neon-green/20">
                <LinkIcon className="h-4 w-4 text-neon-green" />
                <span className="text-white font-mono">
                  {linkCount} link{linkCount !== 1 ? "s" : ""}
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-neon-green/50 text-neon-green font-mono bg-neon-green/10 hover:bg-neon-green/20 hover:shadow-neon transition-all duration-300 cursor-pointer touch-manipulation"
                onClick={onCopyInvite}
              >
                {ring.invite_code}
              </Badge>
              <div className="flex items-center gap-2 bg-neon-gray/30 px-3 py-1 rounded-full border border-neon-green/20">
                {ring.is_public ? (
                  <>
                    <Globe className="h-4 w-4 text-neon-green" />
                    <span className="text-neon-green font-mono text-sm">
                      Public
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 font-mono text-sm">
                      Private
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={onCopyInvite}
            className="neon-button font-bold text-base md:text-lg px-6 md:px-8 py-3 hover:scale-105 transition-transform duration-200 w-full lg:w-auto touch-manipulation"
          >
            <Copy className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span className="hidden sm:inline">Copy Invite</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        </div>

        {/* Members */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-neon-green uppercase tracking-wider font-mono">
            Ring Members
          </h3>

          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            {displayMembers.map((member, index) => {
              const userName = member.user_name || "Anonymous";
              const userInitials =
                userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "AN";
              const isOwner = member.role === "owner";

              return (
                <div
                  key={member.id}
                  className={cn(
                    "relative group animate-flicker-in",
                    `[animation-delay:${index * 100}ms]`,
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Avatar
                    className={cn(
                      "h-10 w-10 md:h-12 md:w-12 border-2 transition-all duration-300 hover:scale-125 cursor-pointer touch-manipulation",
                      isOwner
                        ? "border-neon-green shadow-neon-lg animate-pulse-glow"
                        : "border-neon-green/40 hover:border-neon-green hover:shadow-neon",
                    )}
                  >
                    {member.avatar_url ? (
                      <AvatarImage src={member.avatar_url} alt={userName} />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        "text-sm font-bold transition-all duration-300 font-mono",
                        isOwner
                          ? "bg-neon-green text-black"
                          : "bg-neon-gray text-neon-green group-hover:bg-neon-green/20",
                      )}
                    >
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  {isOwner && (
                    <div className="absolute -top-1 -right-1">
                      <Crown className="h-4 w-4 md:h-5 md:w-5 text-neon-green animate-bounce" />
                      <div className="absolute inset-0 animate-ping">
                        <Crown className="h-4 w-4 md:h-5 md:w-5 text-neon-green opacity-30" />
                      </div>
                    </div>
                  )}

                  {/* Enhanced Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-neon-dark/95 border border-neon-green/50 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-neon">
                    <div className="text-neon-green font-bold text-sm font-mono">
                      {userName}
                    </div>
                    <div className="text-gray-400 capitalize font-mono text-xs">
                      {member.role}
                    </div>
                    {member.user_email && (
                      <div className="text-gray-500 text-xs font-mono">
                        {member.user_email}
                      </div>
                    )}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neon-green/50" />
                  </div>
                </div>
              );
            })}

            {remainingCount > 0 && (
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-neon-green/30 bg-neon-gray/50 flex items-center justify-center hover:border-neon-green hover:shadow-neon transition-all duration-300 cursor-pointer touch-manipulation">
                <span className="text-xs md:text-sm text-neon-green font-bold font-mono">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingHeader;
