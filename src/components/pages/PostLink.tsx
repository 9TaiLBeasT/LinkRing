import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Link, Users, Globe, Zap, CheckCircle } from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useRings } from "@/hooks/useRings";

const PostLink = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRingId, setSelectedRingId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { rings, loading: ringsLoading } = useRings();

  const extractMetadata = async (url: string) => {
    try {
      // Simple URL validation
      const urlObj = new URL(url);

      // If title is empty, try to extract from URL
      if (!title) {
        const domain = urlObj.hostname.replace("www.", "");
        const path = urlObj.pathname.split("/").filter(Boolean).join(" ");
        const suggestedTitle = path ? `${domain} - ${path}` : domain;
        setTitle(suggestedTitle);
      }
    } catch (error) {
      // Invalid URL, don't update title
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl && newUrl.startsWith("http")) {
      extractMetadata(newUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post links",
        variant: "destructive",
      });
      return;
    }

    if (!url || !title || !selectedRingId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate URL
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("shared_links")
        .insert({
          url: url.trim(),
          title: title.trim(),
          description: description.trim() || null,
          ring_id: selectedRingId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your link has been shared with the ring",
      });

      // Reset form after a delay
      setTimeout(() => {
        setUrl("");
        setTitle("");
        setDescription("");
        setSelectedRingId("");
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error posting link:", error);
      toast({
        title: "Error",
        description: "Failed to post link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neon-dark text-white font-mono">
      {/* Header */}
      <div className="border-b border-neon-green/20 bg-neon-dark/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-neon-green hover:bg-neon-green/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-neon-green glitch-text">
              Share a Link
            </h1>
          </div>
          <p className="text-gray-400">
            Share interesting links with your rings
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isSuccess ? (
          <Card className="bg-gray-900/95 border border-neon-green/30 backdrop-filter backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-neon-green mx-auto mb-4" />
                <h3 className="text-xl font-bold text-neon-green mb-2">
                  Link Shared Successfully!
                </h3>
                <p className="text-gray-400 mb-6">
                  Your link has been added to the ring and is now visible to all
                  members.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => navigate("/explore")}
                    className="neon-button"
                  >
                    View in Explore
                  </Button>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    Share Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900/95 border border-neon-green/30 backdrop-filter backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Post New Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    URL *
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="neon-input pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter a descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="neon-input"
                    required
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <Textarea
                    placeholder="Add a description or your thoughts about this link (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="neon-input min-h-[100px] resize-none"
                    rows={4}
                  />
                </div>

                {/* Ring Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Share to Ring *
                  </label>
                  <Select
                    value={selectedRingId}
                    onValueChange={setSelectedRingId}
                  >
                    <SelectTrigger className="neon-input">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Select a ring to share with" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-neon-gray/95 backdrop-blur-md border-neon-green/30">
                      {ringsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading rings...
                        </SelectItem>
                      ) : rings.length === 0 ? (
                        <SelectItem value="no-rings" disabled>
                          No rings available
                        </SelectItem>
                      ) : (
                        rings.map((ring) => (
                          <SelectItem key={ring.id} value={ring.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{ring.name}</span>
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs border-neon-green/30 text-neon-green"
                              >
                                {ring.member_count || 0} members
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {rings.length === 0 && !ringsLoading && (
                    <p className="text-sm text-gray-400">
                      You need to join or create a ring before sharing links.
                      <Button
                        variant="link"
                        className="text-neon-green p-0 ml-1 h-auto"
                        onClick={() => navigate("/dashboard")}
                      >
                        Go to Dashboard
                      </Button>
                    </p>
                  )}
                </div>

                {/* URL Preview */}
                {url && (
                  <div className="p-4 bg-neon-gray/20 rounded-lg border border-neon-green/20">
                    <h4 className="text-sm font-medium text-neon-green mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Link Preview
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-white font-medium">
                        {title || "No title"}
                      </p>
                      <p className="text-xs text-gray-400 break-all">{url}</p>
                      {description && (
                        <p className="text-xs text-gray-300 mt-2">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !url || !title || !selectedRingId}
                    className="neon-button flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Share Link
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUrl("");
                      setTitle("");
                      setDescription("");
                      setSelectedRingId("");
                    }}
                    className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PostLink;
