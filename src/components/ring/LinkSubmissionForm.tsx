import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Loader2,
  X,
  Plus,
  Link,
  Sparkles,
  Play,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  detectPlatform,
  extractEmbedData,
  getPlatformDisplayName,
  getPlatformIcon,
  isEmbeddable,
} from "@/lib/embedUtils";
import EmbedPlayer from "@/components/ui/embed-player";

interface LinkSubmissionFormProps {
  onSubmit: (
    url: string,
    title: string,
    description?: string,
    tags?: string[],
    embedType?: string,
    embedData?: any,
  ) => Promise<void>;
  className?: string;
}

const SUGGESTED_TAGS = [
  "Article",
  "Video",
  "Tool",
  "Tutorial",
  "News",
  "Resource",
  "Design",
  "Code",
  "AI",
  "Tech",
  "Business",
  "Fun",
  "Meme",
  "Music",
  "Gaming",
  "Science",
];

const LinkSubmissionForm = ({
  onSubmit,
  className,
}: LinkSubmissionFormProps) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [embedPreview, setEmbedPreview] = useState<any>(null);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  const extractTitleFromUrl = async (urlString: string) => {
    try {
      const domain = new URL(urlString).hostname.replace("www.", "");
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return "Shared Link";
    }
  };

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Check if URL is embeddable and extract embed data
    if (newUrl) {
      const embedData = extractEmbedData(newUrl);
      if (embedData) {
        setEmbedPreview(embedData);
        setShowEmbedPreview(true);

        // Auto-set title if not already set
        if (!title) {
          const platformName = getPlatformDisplayName(embedData.type as any);
          const extractedTitle = embedData.title || `${platformName} Content`;
          setTitle(extractedTitle);
        }
      } else {
        setEmbedPreview(null);
        setShowEmbedPreview(false);

        // Fallback title extraction for non-embeddable links
        if (!title) {
          const extractedTitle = await extractTitleFromUrl(newUrl);
          setTitle(extractedTitle);
        }
      }
    } else {
      setEmbedPreview(null);
      setShowEmbedPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    setLoading(true);
    setIsSubmitting(true);

    try {
      console.log("Submitting link with embed data:", {
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        embedType: embedPreview?.type || undefined,
        embedData: embedPreview || undefined,
      });

      await onSubmit(
        url.trim(),
        title.trim(),
        description.trim() || undefined,
        selectedTags.length > 0 ? selectedTags : undefined,
        embedPreview?.type || undefined,
        embedPreview || undefined,
      );

      // Reset form with animation
      setUrl("");
      setTitle("");
      setDescription("");
      setSelectedTags([]);
      setIsExpanded(false);
      setEmbedPreview(null);
      setShowEmbedPreview(false);
    } catch (error) {
      console.error("Error submitting link:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSubmitting(false), 1000); // Keep animation for a bit
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div
      className={cn(
        "bg-neon-dark/98 backdrop-blur-lg border-b border-neon-green/30 p-4 md:p-6 shadow-neon-lg",
        className,
      )}
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 md:gap-3 mb-4">
            <Link className="h-5 w-5 md:h-6 md:w-6 text-neon-green animate-pulse" />
            <h2 className="text-lg md:text-xl font-bold text-neon-green font-mono">
              <span className="hidden sm:inline">Share Link to Ring</span>
              <span className="sm:hidden">Share Link</span>
            </h2>
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-neon-green animate-bounce" />
          </div>

          {/* URL Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="🔗 Paste your URL here..."
                className={cn(
                  "neon-input text-base md:text-lg py-3 pl-4 pr-12 transition-all duration-300 h-12 md:h-auto touch-manipulation",
                  url && "border-neon-green/60 shadow-neon",
                  embedPreview && "border-blue-500/60 shadow-blue-500/20",
                )}
                required
                onFocus={() => setIsExpanded(true)}
              />
              {url && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {embedPreview && (
                    <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                      <span>{getPlatformIcon(embedPreview.type)}</span>
                      <span className="font-mono">Embeddable</span>
                    </div>
                  )}
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!url.trim() || !title.trim() || loading}
              className={cn(
                "neon-button px-6 md:px-8 py-3 text-base md:text-lg font-bold transition-all duration-300 relative overflow-hidden h-12 md:h-auto w-full sm:w-auto touch-manipulation",
                loading && "animate-pulse-glow",
                isSubmitting && "animate-bounce",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span className="animate-pulse">
                    <span className="hidden sm:inline">Sharing...</span>
                    <span className="sm:hidden">Sharing</span>
                  </span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Share to Ring</span>
                  <span className="sm:hidden">Share</span>
                </>
              )}
              {/* Sending animation overlay */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[slide-in-right_0.8s_ease-out]" />
              )}
            </Button>
          </div>

          {/* Embed Preview */}
          {showEmbedPreview && embedPreview && (
            <div className="space-y-4 animate-slide-in-bottom">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-blue-400 font-mono">
                    Embed Preview
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {getPlatformDisplayName(embedPreview.type)}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmbedPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Hide Preview
                </Button>
              </div>

              <div className="bg-neon-dark/50 p-4 rounded-xl border border-blue-500/30">
                <EmbedPlayer
                  embedData={embedPreview}
                  compact={true}
                  autoPlay={false}
                  className="max-w-md mx-auto"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">
                  This link will be embedded directly in your ring feed!
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Enhanced viewing experience for ring members</span>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Form */}
          {(isExpanded || url) && (
            <div className="space-y-6 animate-slide-in-bottom">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neon-green font-mono uppercase tracking-wide">
                  Link Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy title..."
                  className="neon-input text-base md:text-lg py-3 h-12 md:h-auto touch-manipulation"
                  required
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-neon-green font-mono uppercase tracking-wide">
                  Tags (Click to Select)
                </label>

                {/* Suggested Tags */}
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map((tag, index) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:scale-110 font-mono text-sm py-1 px-3",
                        selectedTags.includes(tag)
                          ? "bg-neon-green text-black border-neon-green shadow-neon animate-pulse-glow"
                          : "border-neon-green/40 text-neon-green hover:border-neon-green hover:shadow-neon hover:bg-neon-green/10",
                        `[animation-delay:${index * 50}ms]`,
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <span className="ml-1 animate-bounce">✓</span>
                      )}
                    </Badge>
                  ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Create custom tag..."
                    className="neon-input flex-1 h-12 md:h-auto touch-manipulation"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCustomTag())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                    className="neon-button px-4 h-12 md:h-auto w-full sm:w-auto touch-manipulation"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2 sm:hidden">Add Tag</span>
                  </Button>
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400 font-mono">
                      Selected Tags ({selectedTags.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag, index) => (
                        <Badge
                          key={tag}
                          className={cn(
                            "bg-neon-green text-black border-neon-green shadow-neon font-mono animate-flicker-in",
                            `[animation-delay:${index * 100}ms]`,
                          )}
                        >
                          {tag}
                          <X
                            className="h-3 w-3 ml-2 cursor-pointer hover:text-red-500 transition-colors duration-200"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neon-green font-mono uppercase tracking-wide">
                  Comment (Optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add your thoughts about this link..."
                  className="neon-input min-h-[80px] md:min-h-[80px] resize-none text-base md:text-lg touch-manipulation"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right font-mono">
                  {description.length}/500
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LinkSubmissionForm;
