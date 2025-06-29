import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Globe, Lock } from "lucide-react";
import { useRings } from "@/hooks/useRings";

interface CreateRingDialogProps {
  children?: React.ReactNode;
}

const CreateRingDialog = ({ children }: CreateRingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createRing } = useRings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const result = await createRing(
        name.trim(),
        description.trim() || undefined,
        isPublic,
      );

      if (result) {
        // Reset form and close dialog
        setName("");
        setDescription("");
        setIsPublic(false);
        setOpen(false);

        // Force a small delay to ensure UI updates
        setTimeout(() => {
          console.log("Ring creation completed successfully");
        }, 100);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="neon-button px-6 py-2 rounded-full font-bold text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Create New Ring
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-neon-dark border-neon-green/30 text-white font-mono">
        <DialogHeader>
          <DialogTitle className="text-neon-green text-xl font-bold">
            Create New Ring
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Start a new private link-sharing circle. You'll be the owner and can
            invite others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-neon-green font-medium">
              Ring Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter ring name..."
              className="neon-input"
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-neon-green font-medium"
            >
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this ring is for..."
              className="neon-input min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-neon-green font-medium">
              Ring Visibility
            </Label>
            <div className="flex items-center justify-between p-4 bg-neon-gray/20 rounded-lg border border-neon-green/20">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-neon-green" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <div className="font-medium text-white">
                    {isPublic ? "Public Ring" : "Private Ring"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {isPublic
                      ? "Visible in Explore and Leaderboard"
                      : "Invitation-only, hidden from public"}
                  </div>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="data-[state=checked]:bg-neon-green"
              />
            </div>
            <p className="text-xs text-gray-500">
              {isPublic
                ? "⚠️ Public rings can be discovered by anyone and appear on the global leaderboard"
                : "🔒 Private rings are only accessible to invited members"}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white border border-gray-600 hover:border-neon-green/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="neon-button font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ring
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRingDialog;
