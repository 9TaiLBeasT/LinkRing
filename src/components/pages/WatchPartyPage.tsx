import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft, Zap } from "lucide-react";

const REACTIONS = ["🔥", "😂", "❤️", "👀", "🎉", "👏", "😍", "🤯"];

const WatchPartyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neon-dark flex items-center justify-center">
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
          WatchParty Feature
        </h2>

        {/* Description */}
        <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
          <p className="flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-neon-green animate-pulse" />
            This feature is being improved and will be available soon!
          </p>
          <p>
            We're working on bringing you an amazing synchronized viewing
            experience with real-time chat and multi-platform support.
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-12 p-6 bg-gradient-to-r from-neon-green/10 to-blue-500/10 rounded-xl border border-neon-green/30">
          <p className="text-neon-green font-mono font-bold mb-2">
            Stay Tuned!
          </p>
          <p className="text-gray-300">
            WatchParties will be available in the next update with enhanced
            features and better performance.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => navigate("/dashboard")}
          className="neon-button px-8 py-3 font-bold text-lg mt-8"
        >
          <Play className="h-5 w-5 mr-2" />
          Explore Other Features
        </Button>
      </div>
    </div>
  );
};

export default WatchPartyPage;
