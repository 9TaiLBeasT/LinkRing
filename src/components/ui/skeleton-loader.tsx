import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neon-gray/30", className)}
    />
  );
}

// Ring Card Skeleton
export function RingCardSkeleton() {
  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// Link Card Skeleton
export function LinkCardSkeleton() {
  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-12 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// Settings Section Skeleton
export function SettingsSectionSkeleton() {
  return (
    <div className="bg-neon-dark border border-neon-green/30 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

// Watch Party Card Skeleton
export function WatchPartyCardSkeleton() {
  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

// Member Avatar Skeleton
export function MemberAvatarSkeleton() {
  return <Skeleton className="h-12 w-12 rounded-full" />;
}

// Message Skeleton
export function MessageSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
