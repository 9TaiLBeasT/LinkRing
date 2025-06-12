import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  BarChart2,
  Users,
  Clock,
  Plus,
  Copy,
  Trash2,
  LogOut,
  MoreVertical,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRings, Ring } from "@/hooks/useRings";
import CreateRingDialog from "./CreateRingDialog";
import JoinRingDialog from "./JoinRingDialog";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RingCardProps {
  ring: Ring;
  onDelete?: (ringId: string) => void;
  onLeave?: (ringId: string) => void;
}

interface DashboardGridProps {
  isLoading?: boolean;
}

const RingCard = ({ ring, onDelete, onLeave }: RingCardProps) => {
  const { toast } = useToast();

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(ring.invite_code);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy invite code",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${ring.name}"? This action cannot be undone.`,
      )
    ) {
      onDelete?.(ring.id);
    }
  };

  const handleLeave = () => {
    if (window.confirm(`Are you sure you want to leave "${ring.name}"?`)) {
      onLeave?.(ring.id);
    }
  };

  return (
    <div className="hexagon-card relative p-8 h-48 flex flex-col justify-center items-center text-center group cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Ring Actions Menu */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-neon-green hover:bg-neon-green/10"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neon-dark border-neon-green/30 text-white">
            <DropdownMenuItem
              onClick={copyInviteCode}
              className="hover:bg-neon-green/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Invite Code
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neon-green/20" />
            {ring.is_owner ? (
              <DropdownMenuItem
                onClick={handleDelete}
                className="hover:bg-red-500/10 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Ring
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={handleLeave}
                className="hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Ring
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative z-10">
        <div className="h-12 w-12 bg-neon-green/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:animate-pulse">
          <Users className="h-6 w-6 text-neon-green" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 truncate max-w-[200px]">
          {ring.name}
        </h3>
        <div className="flex items-center justify-center gap-2 text-neon-green/70 text-sm mb-3">
          <span>{ring.member_count || 0} members</span>
          <span className="w-1 h-1 bg-neon-green rounded-full animate-pulse"></span>
          <span>{ring.link_count || 0} links</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="px-2 py-1 bg-neon-green/10 rounded-full text-xs text-neon-green font-mono">
            {ring.invite_code}
          </div>
          {ring.is_owner && (
            <div className="px-2 py-1 bg-yellow-500/10 rounded-full text-xs text-yellow-400 font-mono">
              OWNER
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardGrid = ({ isLoading = false }: DashboardGridProps) => {
  const { rings, loading: ringsLoading, deleteRing, leaveRing } = useRings();
  const [loading, setLoading] = useState(isLoading);

  // Simulate loading for demo purposes
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const totalMembers = rings.reduce(
    (sum, ring) => sum + (ring.member_count || 0),
    0,
  );
  const totalLinks = rings.reduce(
    (sum, ring) => sum + (ring.link_count || 0),
    0,
  );

  if (loading || ringsLoading) {
    return (
      <div className="p-6 h-full">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm h-[220px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-blue-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Loading project data...
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full bg-neon-dark font-mono">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Rings</h1>
        <p className="text-neon-green/70">
          Manage your private link-sharing circles
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="cyber-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-neon-green/20 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-neon-green" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white animate-counter-up">
                {rings.length}
              </div>
              <div className="text-neon-green/70 text-sm">Active Rings</div>
            </div>
          </div>
        </div>

        <div className="cyber-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-neon-green/20 rounded-full flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-neon-green" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white animate-counter-up">
                {totalMembers}
              </div>
              <div className="text-neon-green/70 text-sm">Total Members</div>
            </div>
          </div>
        </div>

        <div className="cyber-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-neon-green/20 rounded-full flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-neon-green" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white animate-counter-up">
                {totalLinks}
              </div>
              <div className="text-neon-green/70 text-sm">Links Shared</div>
            </div>
          </div>
        </div>
      </div>

      {/* Your Rings Grid - Hexagonal/Circuit Style */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Rings</h2>
          <div className="flex gap-3">
            <JoinRingDialog />
            <CreateRingDialog />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rings.map((ring, index) => (
            <div
              key={ring.id}
              className="slide-in-bottom"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RingCard ring={ring} onDelete={deleteRing} onLeave={leaveRing} />
            </div>
          ))}

          {/* Create New Ring Card */}
          <CreateRingDialog>
            <div className="hexagon-card relative p-8 h-48 flex flex-col justify-center items-center text-center group cursor-pointer border-dashed border-neon-green/50 hover:border-neon-green transition-all duration-300">
              <div className="relative z-10">
                <div className="h-12 w-12 bg-neon-green/10 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-neon-green/20 transition-all duration-300">
                  <Plus className="h-6 w-6 text-neon-green" />
                </div>
                <h3 className="text-lg font-bold text-neon-green/80 mb-2">
                  Create Ring
                </h3>
                <p className="text-sm text-gray-400">
                  Start a new link-sharing circle
                </p>
              </div>
            </div>
          </CreateRingDialog>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="cyber-card p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <CreateRingDialog>
            <Button className="neon-button flex-1 h-12 rounded-lg font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Create New Ring
            </Button>
          </CreateRingDialog>
          <JoinRingDialog>
            <Button className="neon-button flex-1 h-12 rounded-lg font-bold">
              <Users className="h-4 w-4 mr-2" />
              Join Ring
            </Button>
          </JoinRingDialog>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;
