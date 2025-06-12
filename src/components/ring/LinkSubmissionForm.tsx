import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, X, Plus, Link, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkSubmissionFormProps {
  onSubmit: (
    url: string,
    title: string,
    description?: string,
    tags?: string[],
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

    if (newUrl && !title) {
      const extractedTitle = await extractTitleFromUrl(newUrl);
      setTitle(extractedTitle);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    setLoading(true);
    setIsSubmitting(true);

    try {
      await onSubmit(
        url.trim(),
        title.trim(),
        description.trim() || undefined,
        selectedTags.length > 0 ? selectedTags : undefined,
      );

      // Reset form with animation
      setUrl("");
      setTitle("");
      setDescription("");
      setSelectedTags([]);
      setIsExpanded(false);
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
        "bg-neon-dark/98 backdrop-blur-lg border-b border-neon-green/30 p-6 shadow-neon-lg",
        className,
      )}
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Link className="h-6 w-6 text-neon-green animate-pulse" />
            <h2 className="text-xl font-bold text-neon-green font-mono">
              Share Link to Ring
            </h2>
            <Sparkles className="h-5 w-5 text-neon-green animate-bounce" />
          </div>

          {/* URL Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="🔗 Paste your URL here..."
                className={cn(
                  "neon-input text-lg py-3 pl-4 pr-12 transition-all duration-300",
                  url && "border-neon-green/60 shadow-neon",
                )}
                required
                onFocus={() => setIsExpanded(true)}
              />
              {url && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!url.trim() || !title.trim() || loading}
              className={cn(
                "neon-button px-8 py-3 text-lg font-bold transition-all duration-300 relative overflow-hidden",
                loading && "animate-pulse-glow",
                isSubmitting && "animate-bounce",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span className="animate-pulse">Sharing...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Share to Ring
                </>
              )}
              {/* Sending animation overlay */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[slide-in-right_0.8s_ease-out]" />
              )}
            </Button>
          </div>

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
                  className="neon-input text-lg py-3"
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
                <div className="flex gap-3">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Create custom tag..."
                    className="neon-input flex-1"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCustomTag())
                    }
                  />
                  <Button
                    type="button"
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                    className="neon-button px-4"
                  >
                    <Plus className="h-4 w-4" />
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
                  className="neon-input min-h-[80px] resize-none text-lg"
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
