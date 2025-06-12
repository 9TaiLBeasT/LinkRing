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
import { UserPlus, Loader2 } from "lucide-react";
import { useRings } from "@/hooks/useRings";

interface JoinRingDialogProps {
  children?: React.ReactNode;
}

const JoinRingDialog = ({ children }: JoinRingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { joinRing } = useRings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    const success = await joinRing(inviteCode.trim());

    if (success) {
      setInviteCode("");
      setOpen(false);
    }
    setLoading(false);
  };

  const formatInviteCode = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    // Limit to 8 characters
    return cleaned.slice(0, 8);
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInviteCode(e.target.value);
    setInviteCode(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="neon-button px-6 py-2 rounded-full font-bold text-sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Join Ring
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-neon-dark border-neon-green/30 text-white font-mono">
        <DialogHeader>
          <DialogTitle className="text-neon-green text-xl font-bold">
            Join a Ring
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the invite code to join an existing ring. You'll become a
            member and can share links.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode" className="text-neon-green font-medium">
              Invite Code *
            </Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={handleInviteCodeChange}
              placeholder="Enter 8-character code..."
              className="neon-input text-center text-lg font-mono tracking-widest"
              required
              maxLength={8}
              style={{ letterSpacing: "0.2em" }}
            />
            <p className="text-xs text-gray-500">
              Invite codes are 8 characters long (letters and numbers)
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
              disabled={inviteCode.length !== 8 || loading}
              className="neon-button font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Ring
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRingDialog;
