import React from "react";
import { useToast } from "@/components/ui/use-toast";

interface CreateWatchPartyDialogProps {
  children: React.ReactNode;
  ringId?: string;
}

const CATEGORIES = [
  { value: "general", label: "🌐 General", description: "Mixed content" },
  {
    value: "music",
    label: "🎵 Music",
    description: "Songs, albums, playlists",
  },
  {
    value: "memes",
    label: "😂 Memes",
    description: "Funny videos and content",
  },
  { value: "tech", label: "💻 Tech", description: "Tech talks, tutorials" },
  { value: "gaming", label: "🎮 Gaming", description: "Game streams, reviews" },
  {
    value: "education",
    label: "📚 Education",
    description: "Learning content",
  },
  {
    value: "entertainment",
    label: "🎬 Entertainment",
    description: "Movies, shows, clips",
  },
  { value: "sports", label: "⚽ Sports", description: "Sports content" },
];

const CreateWatchPartyDialog = ({ children }: CreateWatchPartyDialogProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Coming Soon! 🎬",
      description:
        "WatchParties feature is being improved and will be available soon!",
      className: "bg-neon-dark border-neon-green text-neon-green",
    });
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
};

export default CreateWatchPartyDialog;
