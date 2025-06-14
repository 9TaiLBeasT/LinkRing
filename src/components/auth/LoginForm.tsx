import { useState, useRef } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  const handleEmailClick = () => {
    emailRef.current?.focus();
  };

  const handlePasswordClick = () => {
    passwordRef.current?.focus();
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
              htmlFor="email"
              className="text-sm font-medium text-neon-green/80 cursor-pointer"
              onClick={handleEmailClick}
            >
              Email
            </Label>
            <div className="relative" onClick={handleEmailClick}>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                className="neon-input h-12 rounded-lg placeholder:text-gray-500 cursor-text focus:cursor-text"
                autoComplete="email"
                style={{ pointerEvents: "auto" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-neon-green/80 cursor-pointer"
                onClick={handlePasswordClick}
              >
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-neon-green hover:text-neon-green/80 transition-colors z-10 relative"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative" onClick={handlePasswordClick}>
              <Input
                ref={passwordRef}
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isLoading}
                className="neon-input h-12 rounded-lg placeholder:text-gray-500 cursor-text focus:cursor-text"
                autoComplete="current-password"
                style={{ pointerEvents: "auto" }}
              />
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-slide-in-bottom">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="neon-button ripple-effect w-full h-12 rounded-full font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-sm text-center text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-neon-green hover:text-neon-green/80 font-medium transition-colors underline hover:no-underline z-10 relative"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
