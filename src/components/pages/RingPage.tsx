import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-spinner";
import { useRingData } from "@/hooks/useRingData";
import RingHeader from "@/components/ring/RingHeader";
import LinkSubmissionForm from "@/components/ring/LinkSubmissionForm";
import LinkCard from "@/components/ring/LinkCard";
import { cn } from "@/lib/utils";
import { useAuth } from "../../../supabase/auth";
import Sidebar, { SidebarToggle } from "@/components/dashboard/layout/Sidebar";
import JoinRingDialog from "@/components/dashboard/JoinRingDialog";
import { Globe, UserPlus, Copy } from "lucide-react";

const RingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close sidebar by default on mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle navigation to ring
  const handleRingNavigation = (ringId: string) => {
    // This would be handled by the router, but we can add any additional logic here
    console.log("Navigating to ring:", ringId);
  };

  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  const { ring, members, links, loading, shareLink, copyInviteCode } =
    useRingData(id);

  // Check if current user is a member
  const isMember = user && members.some((member) => member.user_id === user.id);
  const canShareLinks = isMember;
  const canViewContent = ring && (ring.is_public || isMember);

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
      <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          activeItem="Ring"
        />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : sidebarOpen ? "ml-0" : "-ml-[280px]",
          )}
        >
          <div className={cn("min-h-screen", isMobile ? "pt-16" : "pt-0")}>
            {/* Ring Header */}
            <RingHeader
              ring={ring}
              members={members}
              linkCount={links.length}
              onCopyInvite={copyInviteCode}
            />

            {/* Link Submission Form - Sticky - Only for members */}
            {canShareLinks && (
              <div className="sticky top-0 z-20">
                <LinkSubmissionForm onSubmit={handleShareLink} />
              </div>
            )}

            {/* Public Ring Notice for Non-Members */}
            {ring && ring.is_public && !isMember && (
              <div className="bg-neon-gray/30 border border-neon-green/30 rounded-xl p-6 mx-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="h-6 w-6 text-neon-green" />
                  <h3 className="text-xl font-bold text-neon-green font-mono">
                    Public Ring - Read Only
                  </h3>
                </div>
                <p className="text-gray-300 mb-4">
                  You're viewing this public ring as a guest. Join the ring to
                  share links and participate in discussions.
                </p>
                <div className="flex gap-3">
                  <JoinRingDialog>
                    <Button className="neon-button">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Ring
                    </Button>
                  </JoinRingDialog>
                  <Button
                    variant="outline"
                    onClick={copyInviteCode}
                    className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Code
                  </Button>
                </div>
              </div>
            )}

            {/* Link Feed */}
            <div
              className={cn(
                "max-w-4xl mx-auto pb-20",
                isMobile ? "p-4" : "p-6",
              )}
            >
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
                        Be the first to share a link with your ring! Paste a URL
                        above to get started.
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
                        {links.length} link{links.length !== 1 ? "s" : ""}{" "}
                        shared
                      </div>
                    </div>

                    <div className="space-y-4">
                      {links.map((link, index) => (
                        <div
                          key={link.id}
                          className={cn(
                            "animate-flicker-in",
                            // Stagger animation delay for first 10 items
                            index < 10 && `[animation-delay:${index * 150}ms]`,
                          )}
                        >
                          <LinkCard link={link} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RingPage;
