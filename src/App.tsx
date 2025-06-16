import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import { AuthProvider, useAuth } from "../supabase/auth";
import { Toaster } from "./components/ui/toaster";
import { LoadingScreen } from "./components/ui/loading-spinner";
import ErrorBoundary from "./components/ui/error-boundary";

// Lazy load components for better performance
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const SignUpForm = lazy(() => import("./components/auth/SignUpForm"));
const Dashboard = lazy(() => import("./components/pages/dashboard"));
const Success = lazy(() => import("./components/pages/success"));
const Home = lazy(() => import("./components/pages/home"));
const RingPage = lazy(() => import("./components/pages/RingPage"));
const Explore = lazy(() => import("./components/pages/Explore"));
const SavedLinks = lazy(() => import("./components/pages/SavedLinks"));
const PostLink = lazy(() => import("./components/pages/PostLink"));
const Leaderboard = lazy(() => import("./components/pages/Leaderboard"));
const WeeklyDigest = lazy(() => import("./components/pages/WeeklyDigest"));
const Settings = lazy(() => import("./components/pages/Settings"));
const Help = lazy(() => import("./components/pages/Help"));
const ExploreWatchParties = lazy(
  () => import("./components/pages/ExploreWatchParties"),
);
const WatchPartyPage = lazy(() => import("./components/pages/WatchPartyPage"));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen text="Loading page..." />}>
        {/* Tempo routes need to be rendered first to avoid conflicts */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/success" element={<Success />} />
          <Route
            path="/explore"
            element={
              <PrivateRoute>
                <Explore />
              </PrivateRoute>
            }
          />
          <Route
            path="/ring/:id"
            element={
              <PrivateRoute>
                <RingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <PrivateRoute>
                <SavedLinks />
              </PrivateRoute>
            }
          />
          <Route
            path="/saved-links"
            element={
              <PrivateRoute>
                <SavedLinks />
              </PrivateRoute>
            }
          />
          <Route
            path="/post"
            element={
              <PrivateRoute>
                <PostLink />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/weekly-digest"
            element={
              <PrivateRoute>
                <WeeklyDigest />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/help"
            element={
              <PrivateRoute>
                <Help />
              </PrivateRoute>
            }
          />
          <Route
            path="/explore-watchparties"
            element={
              <PrivateRoute>
                <ExploreWatchParties />
              </PrivateRoute>
            }
          />
          <Route
            path="/watchparty/:id"
            element={
              <PrivateRoute>
                <WatchPartyPage />
              </PrivateRoute>
            }
          />
          {/* Tempo routes fallback */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={<div>Tempo Route</div>} />
          )}
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div>
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
