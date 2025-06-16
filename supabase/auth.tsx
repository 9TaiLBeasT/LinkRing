import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error);
        }
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to get session:", error);
        setUser(null);
        setLoading(false);
      });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    username: string,
  ) => {
    try {
      // First check if username is available
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (checkError) {
        console.error("Error checking username:", checkError);
        // Continue with signup even if username check fails
      }

      if (existingUser) {
        throw new Error("Username is already taken");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username.toLowerCase(),
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }

      // Wait a moment for the trigger to create the user record, then update with username
      if (data.user) {
        // Use a small delay to ensure the trigger has executed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update the user record with the username (the trigger creates the base record)
        const { error: updateError } = await supabase
          .from("users")
          .update({
            username: username.toLowerCase(),
            full_name: fullName || "",
          })
          .eq("id", data.user.id);

        if (updateError) {
          console.error(
            "Error updating user profile with username:",
            updateError,
          );
          // Try to insert if update failed (in case trigger didn't work)
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            user_id: data.user.id,
            email: data.user.email || "",
            full_name: fullName || "",
            username: username.toLowerCase(),
            token_identifier: data.user.email || data.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error creating user profile:", insertError);
            throw new Error("Failed to create user profile. Please try again.");
          }
        }
      }

      console.log("Sign up successful:", !!data.user);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      console.log("Sign in successful:", !!data.user);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Initiating Google sign in...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google sign in error:", error);
        throw error;
      }

      console.log("Google sign in initiated successfully:", data);
      // The redirect will happen automatically, no need to manually navigate
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      console.log("Sign out successful");
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signInWithGoogle, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
