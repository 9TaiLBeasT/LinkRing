import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Sidebar, { SidebarToggle } from "@/components/dashboard/layout/Sidebar";

const CATEGORIES = [
  { value: "all", label: "🌐 All Categories" },
  { value: "general", label: "🌐 General" },
  { value: "music", label: "🎵 Music" },
  { value: "memes", label: "😂 Memes" },
  { value: "tech", label: "💻 Tech" },
  { value: "gaming", label: "🎮 Gaming" },
  { value: "education", label: "📚 Education" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "sports", label: "⚽ Sports" },
];

const ExploreWatchParties = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
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

  return (
    <div className="min-h-screen bg-neon-dark">
      <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          activeItem="Explore"
        />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : sidebarOpen ? "ml-0" : "-ml-[280px]",
          )}
        >
          <div
            className={cn(
              "min-h-screen flex items-center justify-center",
              isMobile ? "pt-16" : "pt-0",
            )}
          >
            <div className="text-center space-y-8 animate-flicker-in max-w-2xl mx-auto p-8">
              {/* Back Button */}
              <div className="flex justify-center mb-8">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="text-gray-400 hover:text-neon-green transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Coming Soon Icon */}
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-neon-green/30 flex items-center justify-center hover:border-neon-green hover:shadow-neon transition-all duration-500 group">
                  <div className="text-6xl animate-pulse group-hover:scale-110 transition-transform duration-300">
                    🎬
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-green/10 via-neon-green/5 to-neon-green/10 animate-pulse" />
              </div>

              {/* Title */}
              <h1
                className="text-4xl md:text-6xl font-bold text-neon-green font-mono glitch-text mb-4"
                data-text="Coming Soon!"
              >
                Coming Soon!
              </h1>

              {/* Subtitle */}
              <h2 className="text-2xl md:text-3xl font-semibold text-white font-mono mb-6">
                WatchParties Feature
              </h2>

              {/* Description */}
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-neon-green animate-pulse" />
                  We're working hard to bring you an amazing watch party
                  experience!
                </p>
                <p>
                  Soon you'll be able to watch videos together with friends in
                  real-time, chat during movies, and create shared viewing
                  experiences.
                </p>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="cyber-card p-6 bg-neon-gray/10 border border-neon-green/20 rounded-xl">
                  <div className="text-3xl mb-3">🎥</div>
                  <h3 className="text-neon-green font-bold mb-2">
                    Synchronized Viewing
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Watch videos in perfect sync with your friends
                  </p>
                </div>
                <div className="cyber-card p-6 bg-neon-gray/10 border border-neon-green/20 rounded-xl">
                  <div className="text-3xl mb-3">💬</div>
                  <h3 className="text-neon-green font-bold mb-2">Live Chat</h3>
                  <p className="text-gray-400 text-sm">
                    React and chat in real-time during playback
                  </p>
                </div>
                <div className="cyber-card p-6 bg-neon-gray/10 border border-neon-green/20 rounded-xl">
                  <div className="text-3xl mb-3">🌐</div>
                  <h3 className="text-neon-green font-bold mb-2">
                    Multi-Platform
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Support for YouTube, Spotify, and more
                  </p>
                </div>
                <div className="cyber-card p-6 bg-neon-gray/10 border border-neon-green/20 rounded-xl">
                  <div className="text-3xl mb-3">🎮</div>
                  <h3 className="text-neon-green font-bold mb-2">
                    Host Controls
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Full control over playback and party settings
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-12 p-6 bg-gradient-to-r from-neon-green/10 to-blue-500/10 rounded-xl border border-neon-green/30">
                <p className="text-neon-green font-mono font-bold mb-2">
                  Stay Tuned!
                </p>
                <p className="text-gray-300">
                  We're putting the finishing touches on this feature. It will
                  be available in the next update!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExploreWatchParties;
