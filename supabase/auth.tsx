import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle email confirmation - create profile if it doesn't exist
      if (event === "SIGNED_IN" && session?.user) {
        await ensureUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to ensure user profile exists
  const ensureUserProfile = async (user: any) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create it
        const fullName =
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        const username =
          user.user_metadata?.username ||
          user.email
            ?.split("@")[0]
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, "_") ||
          `user_${user.id.slice(0, 8)}`;

        await createUserProfile(user, fullName, username);
      }
    } catch (error) {
      console.error("Error ensuring user profile:", error);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    username: string,
  ) => {
    try {
      // First check if username is available
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username.toLowerCase())
        .limit(1);

      if (
        checkError &&
        !checkError.message?.includes('relation "users" does not exist')
      ) {
        console.error("Error checking username:", checkError);
        throw new Error("Failed to check username availability");
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error("Username is already taken");
      }

      // Sign up with Supabase Auth first
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

      // Only create user profile if auth signup was successful and user exists
      if (data.user && !data.user.email_confirmed_at) {
        // For email confirmation flow, we'll create the profile after confirmation
        console.log("User created, email confirmation required");
      } else if (data.user) {
        // Create user profile immediately if no email confirmation needed
        await createUserProfile(data.user, fullName, username.toLowerCase());
      }

      console.log("Sign up successful:", !!data.user);
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  // Helper function to create user profile
  const createUserProfile = async (
    user: any,
    fullName: string,
    username: string,
  ) => {
    try {
      const { error: profileError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: fullName,
          username: username,
          avatar_url: user.user_metadata?.avatar_url || null,
        },
        {
          onConflict: "id",
        },
      );

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't throw error for profile creation issues during signup
        // The user can still use the app, profile can be created later
        console.warn("User profile creation failed, but auth user exists");
      } else {
        console.log("User profile created successfully");
      }
    } catch (error) {
      console.error("Profile creation error:", error);
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
