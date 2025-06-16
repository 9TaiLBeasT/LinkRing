import { useState, useRef } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fullNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signUp(email, password, fullName, username);
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
        duration: 5000,
      });
      navigate("/login");
    } catch (error: any) {
      setError(error.message || "Error creating account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(""); // Clear error when user starts typing
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("username", usernameToCheck.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("Error checking username:", error);
        // On error, assume username is available to not block user
        setUsernameAvailable(true);
        return;
      }

      // If data exists, username is taken; if null, it's available
      setUsernameAvailable(!data);
    } catch (error) {
      console.error("Username check failed:", error);
      // On error, assume username is available to not block user
      setUsernameAvailable(true);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    setError("");

    // Debounce username check
    const timeoutId = setTimeout(() => {
      if (value.length >= 3) {
        checkUsernameAvailability(value);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleFullNameClick = () => {
    fullNameRef.current?.focus();
  };

  const handleUsernameClick = () => {
    usernameRef.current?.focus();
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
              htmlFor="fullName"
              className="text-sm font-medium text-neon-green/80 cursor-pointer"
              onClick={handleFullNameClick}
            >
              Full Name
            </Label>
            <div className="relative" onClick={handleFullNameClick}>
              <Input
                ref={fullNameRef}
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={handleFullNameChange}
                required
                disabled={isLoading}
                className="neon-input h-12 rounded-lg placeholder:text-gray-500 cursor-text focus:cursor-text"
                autoComplete="name"
                style={{ pointerEvents: "auto" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-neon-green/80 cursor-pointer"
              onClick={handleUsernameClick}
            >
              Username
            </Label>
            <div className="relative" onClick={handleUsernameClick}>
              <Input
                ref={usernameRef}
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={handleUsernameChange}
                required
                disabled={isLoading}
                className="neon-input h-12 rounded-lg placeholder:text-gray-500 cursor-text focus:cursor-text"
                autoComplete="username"
                style={{ pointerEvents: "auto" }}
                minLength={3}
                maxLength={50}
              />
              {checkingUsername && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin"></div>
                </div>
              )}
              {!checkingUsername &&
                usernameAvailable !== null &&
                username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {usernameAvailable ? (
                      <div className="w-4 h-4 bg-neon-green rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✗</span>
                      </div>
                    )}
                  </div>
                )}
            </div>
            <p className="text-xs text-neon-green/60 mt-1">
              Username must be 3-50 characters, lowercase letters, numbers, and
              underscores only
            </p>
            {!checkingUsername &&
              usernameAvailable === false &&
              username.length >= 3 && (
                <p className="text-xs text-red-400 mt-1">
                  Username is already taken
                </p>
              )}
          </div>
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
            <Label
              htmlFor="password"
              className="text-sm font-medium text-neon-green/80 cursor-pointer"
              onClick={handlePasswordClick}
            >
              Password
            </Label>
            <div className="relative" onClick={handlePasswordClick}>
              <Input
                ref={passwordRef}
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isLoading}
                minLength={8}
                className="neon-input h-12 rounded-lg placeholder:text-gray-500 cursor-text focus:cursor-text"
                autoComplete="new-password"
                style={{ pointerEvents: "auto" }}
              />
            </div>
            <p className="text-xs text-neon-green/60 mt-1">
              Password must be at least 8 characters
            </p>
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-slide-in-bottom">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={
              isLoading ||
              !email.trim() ||
              !password.trim() ||
              !fullName.trim() ||
              !username.trim() ||
              username.length < 3 ||
              password.length < 8 ||
              usernameAvailable === false ||
              checkingUsername
            }
            className="neon-button ripple-effect w-full h-12 rounded-full font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Create account"}
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
              className="text-neon-green hover:text-neon-green/80 font-medium transition-colors underline hover:no-underline z-10 relative"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
