import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  Settings,
  User,
  Zap,
  Shield,
  Users,
  Globe,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neon-dark text-white font-mono">
      {/* Cyberpunk Navigation */}
      <header className="fixed top-0 z-50 w-full bg-neon-dark/90 backdrop-blur-md border-b border-neon-green/20">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <Link
              to="/"
              className="font-bold text-2xl text-neon-green hover:animate-pulse-glow transition-all duration-300"
            >
              LinkRing
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-neon-green hover:bg-neon-green/10 hover:text-neon-green border border-neon-green/30 hover:border-neon-green transition-all duration-300"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 hover:cursor-pointer border-2 border-neon-green/50 hover:border-neon-green transition-all duration-300">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback className="bg-neon-gray text-neon-green">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-neon-gray border-neon-green/30 text-white"
                  >
                    <DropdownMenuLabel className="text-neon-green/70">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neon-green/20" />
                    <DropdownMenuItem className="cursor-pointer hover:bg-neon-green/10 text-white">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-neon-green/10 text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neon-green/20" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-red-500/10 text-red-400"
                      onSelect={() => signOut()}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-neon-green hover:bg-neon-green/10 hover:text-neon-green transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-neon-green text-black hover:bg-neon-green/90 font-bold px-6 shadow-neon hover:shadow-neon-lg transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-32 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-7xl font-bold tracking-tight mb-6 text-white">
              <span className="glitch-text" data-text="Build your private">
                Build your private
              </span>{" "}
              <span
                className="text-neon-green animate-glow glitch-text"
                data-text="link ring"
              >
                link ring
              </span>
            </h1>
            <h2 className="text-3xl font-medium text-neon-green/80 mb-8 max-w-4xl mx-auto">
              Private Link-Sharing Circles for the Digital Underground
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Create secure, invite-only rings to share links with your trusted
              network. Experience the future of private collaboration with
              neon-powered aesthetics.
            </p>
            <div className="flex justify-center space-x-8 mb-16">
              <Link to="/signup">
                <Button className="neon-button ripple-effect font-bold px-8 py-4 text-lg rounded-full">
                  Start Sharing → <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-neon-green text-neon-green hover:bg-neon-green/10 font-bold px-8 py-4 text-lg transition-all duration-300 rounded-full"
                >
                  Join Existing Ring
                </Button>
              </Link>
            </div>

            {/* Neon-outline cards sliding in from sides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="cyber-card slide-in-left p-6 rounded-xl">
                <div className="h-12 w-12 bg-neon-green/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-neon-green" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Digest Preview
                </h3>
                <p className="text-gray-400 text-sm">
                  Weekly curated links from your rings
                </p>
              </div>

              <div
                className="cyber-card slide-in-bottom p-6 rounded-xl"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="h-12 w-12 bg-neon-green/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Globe className="h-6 w-6 text-neon-green" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Top Links</h3>
                <p className="text-gray-400 text-sm">
                  Most shared content across the network
                </p>
              </div>

              <div
                className="cyber-card slide-in-right p-6 rounded-xl"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="h-12 w-12 bg-neon-green/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-neon-green" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Invite Code
                </h3>
                <p className="text-gray-400 text-sm">
                  Join exclusive rings with secret codes
                </p>
              </div>
            </div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-1 h-1 bg-neon-green rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 right-1/3 w-1 h-1 bg-neon-green rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </section>

        {/* Testimonial Strip (Auto-scroll) */}
        <section className="py-16 bg-neon-gray/10 overflow-hidden">
          <div className="ticker-scroll flex space-x-8">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-neon-gray/30 p-4 rounded-xl border border-neon-green/20 min-w-[300px]"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-neon-green" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      CyberUser{i + 1}
                    </div>
                    <div className="text-neon-green/70 text-sm">
                      Ring Member
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  "LinkRing revolutionized how our team shares resources. The
                  neon aesthetic is just perfect!"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-neon-gray/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold tracking-tight mb-4 text-white">
                Cyberpunk <span className="text-neon-green">Features</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Advanced link-sharing technology with military-grade security
                and futuristic design
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-neon-gray/50 p-8 rounded-xl border border-neon-green/20 hover:border-neon-green/50 hover:shadow-neon transition-all duration-300 group">
                <div className="h-16 w-16 bg-neon-green/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-neon-green/20 transition-all duration-300">
                  <Shield className="h-8 w-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Secure Rings
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Military-grade encryption protects your private link-sharing
                  circles from unauthorized access.
                </p>
              </div>

              <div className="bg-neon-gray/50 p-8 rounded-xl border border-neon-green/20 hover:border-neon-green/50 hover:shadow-neon transition-all duration-300 group">
                <div className="h-16 w-16 bg-neon-green/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-neon-green/20 transition-all duration-300">
                  <Users className="h-8 w-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Invite System
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Generate unique invite codes to bring trusted members into
                  your exclusive link-sharing network.
                </p>
              </div>

              <div className="bg-neon-gray/50 p-8 rounded-xl border border-neon-green/20 hover:border-neon-green/50 hover:shadow-neon transition-all duration-300 group">
                <div className="h-16 w-16 bg-neon-green/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-neon-green/20 transition-all duration-300">
                  <Zap className="h-8 w-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Real-time Sync
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Lightning-fast synchronization ensures all ring members see
                  updates instantly across devices.
                </p>
              </div>

              <div className="bg-neon-gray/50 p-8 rounded-xl border border-neon-green/20 hover:border-neon-green/50 hover:shadow-neon transition-all duration-300 group">
                <div className="h-16 w-16 bg-neon-green/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-neon-green/20 transition-all duration-300">
                  <Globe className="h-8 w-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Global Access
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Access your rings from anywhere in the digital realm with
                  seamless cross-platform support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-6 text-white">
                  Experience the <span className="text-neon-green">Future</span>{" "}
                  of Link Sharing
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Join the digital underground where privacy meets style. Create
                  your first ring and discover a new way to share links with
                  your trusted network.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span className="text-gray-300">
                      Create unlimited private rings
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-2 h-2 bg-neon-green rounded-full animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <span className="text-gray-300">
                      Invite members with secure codes
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-2 h-2 bg-neon-green rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <span className="text-gray-300">
                      Track activity and engagement
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-neon-gray/30 p-8 rounded-2xl border border-neon-green/30 shadow-neon">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neon-dark/50 rounded-lg border border-neon-green/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                        <span className="text-white font-medium">
                          Dev Team Ring
                        </span>
                      </div>
                      <span className="text-neon-green text-sm">
                        12 members
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-neon-dark/50 rounded-lg border border-neon-green/20">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 bg-neon-green rounded-full animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <span className="text-white font-medium">
                          Design Circle
                        </span>
                      </div>
                      <span className="text-neon-green text-sm">8 members</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-neon-dark/50 rounded-lg border border-neon-green/20">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 bg-neon-green rounded-full animate-pulse"
                          style={{ animationDelay: "1s" }}
                        ></div>
                        <span className="text-white font-medium">
                          Research Hub
                        </span>
                      </div>
                      <span className="text-neon-green text-sm">5 members</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-neon-green text-black hover:bg-neon-green/90 font-bold transition-all duration-300">
                    + Create New Ring
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-neon-green/10 to-transparent">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-white">
              Ready to Enter the{" "}
              <span className="text-neon-green animate-glow">Ring</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join thousands of users who have already discovered the power of
              private link-sharing circles.
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/signup">
                <Button className="bg-neon-green text-black hover:bg-neon-green/90 font-bold px-8 py-4 text-lg shadow-neon-lg hover:shadow-neon-xl transition-all duration-300 transform hover:scale-105">
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-neon-green text-neon-green hover:bg-neon-green/10 font-bold px-8 py-4 text-lg transition-all duration-300"
                >
                  Access Existing Ring
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neon-gray/20 py-16 border-t border-neon-green/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-xl text-neon-green mb-4">
                LinkRing
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The future of private link sharing. Secure, stylish, and built
                for the digital underground.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Discord
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neon-green/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 LinkRing. All rights reserved. Built for the digital
                underground.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-neon-green rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-neon-green rounded-full animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
