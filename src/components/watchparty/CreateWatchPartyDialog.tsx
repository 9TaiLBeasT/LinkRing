import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWatchParties } from "@/hooks/useWatchParty";
import { useRings } from "@/hooks/useRings";
import {
  detectPlatform,
  getPlatformDisplayName,
  getPlatformIcon,
} from "@/lib/embedUtils";
import { Play, Globe, Lock, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const CreateWatchPartyDialog = ({
  children,
  ringId,
}: CreateWatchPartyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState("general");
  const [selectedRingId, setSelectedRingId] = useState(ringId || "none");
  const [loading, setLoading] = useState(false);

  const { createWatchParty } = useWatchParties();
  const { rings } = useRings();
  const navigate = useNavigate();

  const detectedPlatform = detectPlatform(videoUrl);
  const selectedCategory = CATEGORIES.find((cat) => cat.value === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setLoading(true);
    try {
      const party = await createWatchParty({
        videoUrl: videoUrl.trim(),
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        isPublic,
        category,
        ringId: selectedRingId === "none" ? undefined : selectedRingId,
      });

      if (party) {
        setOpen(false);
        // Reset form
        setVideoUrl("");
        setTitle("");
        setDescription("");
        setIsPublic(true);
        setCategory("general");
        setSelectedRingId(ringId || "none");

        // Navigate to the watch party
        navigate(`/watchparty/${party.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    // Auto-generate title from URL if possible
    if (url && !title) {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace("www.", "");
        setTitle(`${getPlatformDisplayName(detectPlatform(url))} Content`);
      } catch {
        // Invalid URL, ignore
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-neon-dark border-neon-green/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-neon-green font-mono text-xl flex items-center gap-2">
            <Play className="h-6 w-6 animate-pulse" />
            Start WatchParty
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a shared viewing experience with your friends. Share videos,
            music, and more in real-time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-neon-green font-medium">
              Video/Music URL *
            </Label>
            <div className="relative">
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=... or any supported link"
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="neon-input pr-20"
                required
              />
              {detectedPlatform && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Badge
                    variant="outline"
                    className="border-neon-green/40 text-neon-green text-xs"
                  >
                    {getPlatformIcon(detectedPlatform)}{" "}
                    {getPlatformDisplayName(detectedPlatform)}
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Supports YouTube, Spotify, Vimeo, Twitch, SoundCloud, and more
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-neon-green font-medium">
              Party Title
            </Label>
            <Input
              id="title"
              placeholder="Give your watch party a catchy name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="neon-input"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-neon-green font-medium"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Tell people what to expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neon-input min-h-[80px] resize-none"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 text-right">
              {description.length}/300
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-neon-green font-medium">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="neon-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neon-gray/95 backdrop-blur-md border-neon-green/30">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-xs text-gray-400">
                        {cat.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ring Selection */}
          {rings.length > 0 && (
            <div className="space-y-2">
              <Label className="text-neon-green font-medium">
                Link to Ring (Optional)
              </Label>
              <Select value={selectedRingId} onValueChange={setSelectedRingId}>
                <SelectTrigger className="neon-input">
                  <SelectValue placeholder="Select a ring or leave empty" />
                </SelectTrigger>
                <SelectContent className="bg-neon-gray/95 backdrop-blur-md border-neon-green/30">
                  <SelectItem value="none">
                    <span className="text-gray-400">
                      No ring - standalone party
                    </span>
                  </SelectItem>
                  {rings.map((ring) => (
                    <SelectItem key={ring.id} value={ring.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        <span>{ring.name}</span>
                        <span className="text-xs text-gray-400">
                          ({ring.member_count} members)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Public/Private Toggle */}
          <div className="space-y-3">
            <Label className="text-neon-green font-medium">Visibility</Label>
            <div className="flex items-center justify-between p-4 bg-neon-gray/20 rounded-lg border border-neon-green/20">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-neon-green" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-white">
                    {isPublic ? "Public Party" : "Private Party"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isPublic
                      ? "Anyone can discover and join your party"
                      : "Only people with the invite code can join"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="data-[state=checked]:bg-neon-green"
              />
            </div>
          </div>

          {/* Preview */}
          {videoUrl && detectedPlatform && (
            <div className="p-4 bg-neon-gray/10 rounded-lg border border-neon-green/20">
              <h4 className="text-neon-green font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Preview
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-neon-green/40 text-neon-green"
                  >
                    {getPlatformIcon(detectedPlatform)}{" "}
                    {getPlatformDisplayName(detectedPlatform)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-blue-500/40 text-blue-400"
                  >
                    {selectedCategory?.label}
                  </Badge>
                  {isPublic ? (
                    <Badge
                      variant="outline"
                      className="border-green-500/40 text-green-400"
                    >
                      <Globe className="h-3 w-3 mr-1" /> Public
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-gray-500/40 text-gray-400"
                    >
                      <Lock className="h-3 w-3 mr-1" /> Private
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-300">
                  {title || "Untitled Watch Party"}
                </p>
                {description && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!videoUrl.trim() || loading}
            className="neon-button font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Party
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWatchPartyDialog;
