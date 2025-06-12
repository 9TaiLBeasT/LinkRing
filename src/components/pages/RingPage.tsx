import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useRingData } from "@/hooks/useRingData";
import RingHeader from "@/components/ring/RingHeader";
import LinkSubmissionForm from "@/components/ring/LinkSubmissionForm";
import LinkCard from "@/components/ring/LinkCard";
import { cn } from "@/lib/utils";
import { useAuth } from "../../../supabase/auth";

const RingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  const { ring, members, links, loading, shareLink, copyInviteCode } =
    useRingData(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-neon-dark flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="h-16 w-16 mx-auto rounded-full border-4 border-neon-green/30 border-t-neon-green animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-neon-green/20 animate-pulse" />
            </div>
          </div>
          <p className="text-neon-green font-mono text-lg animate-pulse">
            Loading ring...
          </p>
        </div>
      </div>
    );
  }

  if (!ring) {
    return (
      <div className="min-h-screen bg-neon-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1
            className="text-2xl font-bold text-white font-mono glitch-text"
            data-text="Ring Not Found"
          >
            Ring Not Found
          </h1>
          <p className="text-gray-400">
            This ring doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => window.history.back()}
            className="neon-button px-6 py-2 rounded-full font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleShareLink = async (
    url: string,
    title: string,
    description?: string,
    tags?: string[],
  ) => {
    await shareLink(url, title, description, tags);
  };

  return (
    <div className="min-h-screen bg-neon-dark">
      {/* Ring Header */}
      <RingHeader
        ring={ring}
        members={members}
        linkCount={links.length}
        onCopyInvite={copyInviteCode}
      />

      {/* Link Submission Form - Sticky */}
      <div className="sticky top-0 z-20">
        <LinkSubmissionForm onSubmit={handleShareLink} />
      </div>

      {/* Link Feed */}
      <div className="max-w-4xl mx-auto p-6 pb-20">
        <div className="space-y-6">
          {links.length === 0 ? (
            <div className="text-center py-16">
              <div className="space-y-6 animate-flicker-in">
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-neon-green/30 flex items-center justify-center hover:border-neon-green hover:shadow-neon transition-all duration-300">
                  <span className="text-3xl animate-pulse">🔗</span>
                </div>
                <h3
                  className="text-2xl font-semibold text-white font-mono glitch-text"
                  data-text="No links shared yet"
                >
                  No links shared yet
                </h3>
                <p className="text-gray-400 max-w-md mx-auto text-lg">
                  Be the first to share a link with your ring! Paste a URL above
                  to get started.
                </p>
                <div className="flex justify-center space-x-2 mt-8">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8 animate-slide-in-left">
                <h2
                  className="text-2xl font-bold text-neon-green font-mono glitch-text"
                  data-text="Link Feed"
                >
                  Link Feed
                </h2>
                <div className="text-sm text-gray-400 bg-neon-gray/50 px-3 py-1 rounded-full border border-neon-green/20">
                  {links.length} link{links.length !== 1 ? "s" : ""} shared
                </div>
              </div>

              <div className="space-y-4">
                {links.map((link, index) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    className={cn(
                      "animate-flicker-in",
                      // Stagger animation delay for first 10 items
                      index < 10 && `[animation-delay:${index * 150}ms]`,
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RingPage;
