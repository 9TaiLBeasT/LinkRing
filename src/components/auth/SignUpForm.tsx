import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, fullName);
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
        duration: 5000,
      });
      navigate("/login");
    } catch (error) {
      setError("Error creating account");
    }
  };

  return (
    <AuthLayout>
      <div className="cyber-card rounded-2xl p-8 w-full max-w-md mx-auto slide-in-bottom">
        {/* Auth method toggle */}
        <div className="flex mb-8">
          <div className="bg-neon-gray/50 p-1 rounded-full w-full flex">
            <button
              type="button"
              className="flex-1 py-2 px-4 rounded-full bg-neon-green text-black font-medium text-sm transition-all duration-300"
            >
              Email
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-4 rounded-full text-gray-400 font-medium text-sm hover:text-white transition-all duration-300"
            >
              Google
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-sm font-medium text-neon-green/80"
            >
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="neon-input h-12 rounded-lg placeholder:text-gray-500"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-neon-green/80"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="neon-input h-12 rounded-lg placeholder:text-gray-500"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-neon-green/80"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="neon-input h-12 rounded-lg placeholder:text-gray-500"
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-xs text-neon-green/60 mt-1">
              Password must be at least 8 characters
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="neon-button ripple-effect w-full h-12 rounded-full font-bold text-sm"
          >
            Create account
          </Button>

          <div className="text-xs text-center text-gray-500 mt-6">
            By creating an account, you agree to our{" "}
            <Link
              to="/"
              className="text-neon-green hover:text-neon-green/80 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/"
              className="text-neon-green hover:text-neon-green/80 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          <div className="text-sm text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-neon-green hover:text-neon-green/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
