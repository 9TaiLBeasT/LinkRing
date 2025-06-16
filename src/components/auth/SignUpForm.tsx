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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
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

  const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("🔥 Google sign up button clicked - event fired!");
    e.preventDefault();
    e.stopPropagation();

    setError("");
    setIsGoogleLoading(true);

    try {
      console.log("🚀 Calling signInWithGoogle...");
      await signInWithGoogle();
      console.log("✅ signInWithGoogle completed");
      // The redirect will happen automatically
    } catch (error: any) {
      console.error("❌ Google sign up error:", error);
      setError(error.message || "Failed to sign up with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="cyber-card rounded-2xl p-8 w-full max-w-md mx-auto slide-in-bottom">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neon-green mb-2">
            Join LinkRing
          </h2>
          <p className="text-gray-400 text-sm">
            Create your account to start sharing
          </p>
        </div>

        {/* Google Sign In Button - Moved to top */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          onMouseDown={(e) => console.log("🖱️ Mouse down on Google button")}
          onMouseUp={(e) => console.log("🖱️ Mouse up on Google button")}
          disabled={isGoogleLoading || isLoading}
          className="w-full h-12 rounded-full font-bold text-sm bg-white hover:bg-gray-100 text-black border border-gray-300 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6 cursor-pointer relative z-10"
          style={{
            pointerEvents: "auto",
            position: "relative",
            zIndex: 10,
            userSelect: "none",
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isGoogleLoading ? "Signing up..." : "Continue with Google"}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neon-green/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neon-dark px-2 text-gray-400">
              Or sign up with email
            </span>
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
              isGoogleLoading ||
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
