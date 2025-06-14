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
  MessageCircle,
  Play,
  Sparkles,
  Link2,
  Eye,
  ArrowRight,
  Star,
  Layers,
  Lock,
  Wifi,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll("[data-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-neon-dark text-white font-mono">
      {/* Cyberpunk Navigation */}
      <header className="fixed top-0 z-50 w-full bg-neon-dark/90 backdrop-blur-md border-b border-neon-green/20">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <Link to="/" className="group relative">
              <div className="stylish-logo text-3xl font-black tracking-wider text-transparent bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-400 bg-clip-text hover:from-cyan-400 hover:via-neon-green hover:to-emerald-400 transition-all duration-500">
                <span className="relative inline-block transform group-hover:scale-110 transition-transform duration-300">
                  Link
                  <span className="text-white font-light">Ring</span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-neon-green/20 to-cyan-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-neon-green rounded-full animate-pulse opacity-80"></div>
                </span>
              </div>
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
        {/* Enhanced Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-purple-500/5 to-cyan-400/5 animate-gradient-shift"></div>
            <div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-float"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            ></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"
              style={{
                transform: `translateY(${scrollY * -0.1}px)`,
                animationDelay: "1s",
              }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse-slow"
              style={{
                transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)`,
                animationDelay: "2s",
              }}
            ></div>
          </div>

          {/* Particle System */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-neon-green/30 rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/30 rounded-full px-6 py-2 mb-6 animate-slide-in-bottom">
                <Sparkles className="h-4 w-4 text-neon-green animate-spin-slow" />
                <span className="text-neon-green font-medium text-sm">
                  Now with Ephemeral Chat & Embed Support
                </span>
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-none">
              <div className="animate-slide-in-left">
                <span className="text-white">Build Your</span>
              </div>
              <div
                className="animate-slide-in-right"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="text-transparent bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-400 bg-clip-text animate-gradient-text">
                  Private Ring
                </span>
              </div>
            </h1>

            <h2
              className="text-2xl md:text-4xl font-light text-neon-green/80 mb-8 max-w-4xl mx-auto animate-slide-in-bottom"
              style={{ animationDelay: "0.4s" }}
            >
              Next-Gen Link Sharing for the
              <span className="font-bold text-white"> Digital Elite</span>
            </h2>

            <p
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in-bottom"
              style={{ animationDelay: "0.6s" }}
            >
              Create secure, invite-only circles to share links with your
              trusted network. Experience real-time collaboration with ephemeral
              chat, rich embeds, and military-grade security.
            </p>

            <div
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16 animate-slide-in-bottom"
              style={{ animationDelay: "0.8s" }}
            >
              <Link to="/signup">
                <Button className="group neon-button ripple-effect font-bold px-10 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-neon-lg hover:shadow-neon-xl relative overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Start Building
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="group border-2 border-neon-green text-neon-green hover:bg-neon-green/10 font-bold px-10 py-4 text-lg transition-all duration-300 rounded-full transform hover:scale-105 hover:shadow-neon relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <Eye className="mr-2 h-5 w-5" />
                    View Demo
                  </span>
                </Button>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto animate-slide-in-bottom"
              style={{ animationDelay: "1s" }}
            >
              <div className="group cyber-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="h-14 w-14 bg-gradient-to-br from-neon-green/20 to-emerald-400/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-7 w-7 text-neon-green group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-green transition-colors">
                  Ephemeral Chat
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Real-time discussions that auto-delete after 16 hours
                </p>
              </div>

              <div
                className="group cyber-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="h-14 w-14 bg-gradient-to-br from-purple-500/20 to-pink-400/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Play className="h-7 w-7 text-purple-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Rich Embeds
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  YouTube, Spotify, Twitter, and more embedded directly
                </p>
              </div>

              <div
                className="group cyber-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="h-14 w-14 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Globe className="h-7 w-7 text-cyan-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  Public Rings
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Share knowledge with the world or keep it private
                </p>
              </div>

              <div
                className="group cyber-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="h-14 w-14 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-emerald-400 group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  Real-time Sync
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Instant updates across all devices and platforms
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Animated Background Elements */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-neon-green rounded-full animate-pulse shadow-neon"></div>
          <div
            className="absolute top-32 left-16 w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="absolute top-40 right-20 w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-neon"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-52 right-32 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.8s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-2.5 h-2.5 bg-neon-green rounded-full animate-pulse shadow-neon"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-32 left-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"
            style={{ animationDelay: "1.3s" }}
          ></div>
          <div
            className="absolute bottom-40 right-1/3 w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-neon"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute bottom-52 right-1/4 w-1 h-1 bg-teal-400 rounded-full animate-pulse"
            style={{ animationDelay: "1.8s" }}
          ></div>

          {/* Floating geometric shapes */}
          <div
            className="absolute top-1/3 left-8 w-4 h-4 border border-neon-green/50 rotate-45 animate-spin"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute top-2/3 right-8 w-6 h-6 border border-purple-400/50 rotate-12 animate-spin"
            style={{ animationDuration: "12s", animationDirection: "reverse" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/6 w-3 h-3 border border-cyan-400/50 rotate-45 animate-spin"
            style={{ animationDuration: "10s" }}
          ></div>
        </section>

        {/* 3D Demo Section */}
        <section
          id="demo"
          data-animate
          className="py-24 bg-gradient-to-b from-neon-dark to-neon-gray/20 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/30 rounded-full px-6 py-2 mb-6">
                <Monitor className="h-4 w-4 text-neon-green" />
                <span className="text-neon-green font-medium text-sm">
                  Interactive Demo
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
                See LinkRing in <span className="text-neon-green">Action</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Experience the future of link sharing with our interactive 3D
                demo
              </p>
            </div>

            {/* 3D Demo Container */}
            <div className="relative max-w-6xl mx-auto">
              <div className="demo-3d-container relative bg-gradient-to-br from-neon-gray/30 to-neon-dark/50 rounded-3xl border border-neon-green/30 p-8 backdrop-blur-lg shadow-neon-xl">
                {/* Mock 3D Dashboard */}
                <div className="relative transform-gpu perspective-1000">
                  <div className="demo-screen transform rotate-x-12 hover:rotate-x-6 transition-transform duration-700 bg-neon-dark rounded-2xl border border-neon-green/40 overflow-hidden shadow-2xl">
                    {/* Mock Header */}
                    <div className="bg-neon-gray/50 p-4 border-b border-neon-green/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-neon-green font-mono text-sm">
                          LinkRing Dashboard
                        </div>
                      </div>
                    </div>

                    {/* Mock Content */}
                    <div className="p-6 space-y-6">
                      {/* Ring Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            name: "Dev Team Ring",
                            members: 12,
                            color: "neon-green",
                            active: true,
                          },
                          {
                            name: "Design Circle",
                            members: 8,
                            color: "purple-400",
                            active: false,
                          },
                          {
                            name: "Research Hub",
                            members: 5,
                            color: "cyan-400",
                            active: false,
                          },
                        ].map((ring, i) => (
                          <div
                            key={i}
                            className={`demo-card bg-neon-gray/30 p-4 rounded-xl border border-${ring.color}/30 hover:border-${ring.color} transition-all duration-300 cursor-pointer group`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className={`w-3 h-3 bg-${ring.color} rounded-full ${ring.active ? "animate-pulse" : ""}`}
                              ></div>
                              <span
                                className={`text-${ring.color} text-xs font-mono`}
                              >
                                {ring.members} members
                              </span>
                            </div>
                            <h3 className="text-white font-medium text-sm mb-2 group-hover:text-neon-green transition-colors">
                              {ring.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                {[...Array(3)].map((_, j) => (
                                  <div
                                    key={j}
                                    className={`w-6 h-6 bg-${ring.color}/20 rounded-full border border-${ring.color}/50`}
                                  ></div>
                                ))}
                              </div>
                              <span className="text-gray-400 text-xs">
                                +{ring.members - 3}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mock Link Feed */}
                      <div className="space-y-3">
                        <h3 className="text-neon-green font-bold text-lg mb-4">
                          Recent Links
                        </h3>
                        {[
                          {
                            title: "Amazing React Tutorial",
                            domain: "youtube.com",
                            type: "video",
                          },
                          {
                            title: "New Design System",
                            domain: "figma.com",
                            type: "design",
                          },
                          {
                            title: "AI Research Paper",
                            domain: "arxiv.org",
                            type: "article",
                          },
                        ].map((link, i) => (
                          <div
                            key={i}
                            className="demo-link-card bg-neon-gray/20 p-4 rounded-lg border border-neon-green/20 hover:border-neon-green/50 transition-all duration-300 cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-neon-green/10 rounded-lg flex items-center justify-center group-hover:bg-neon-green/20 transition-colors">
                                {link.type === "video" && (
                                  <Play className="h-6 w-6 text-neon-green" />
                                )}
                                {link.type === "design" && (
                                  <Layers className="h-6 w-6 text-purple-400" />
                                )}
                                {link.type === "article" && (
                                  <Link2 className="h-6 w-6 text-cyan-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-medium group-hover:text-neon-green transition-colors">
                                  {link.title}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  {link.domain}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-neon-green animate-pulse" />
                                <span className="text-neon-green text-sm font-mono">
                                  3
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-neon-green/20 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-400/20 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-cyan-400/20 rounded-full animate-ping"></div>
              </div>

              {/* Device Mockups */}
              <div className="flex justify-center items-center gap-8 mt-12">
                <div className="text-center group cursor-pointer">
                  <div className="w-16 h-16 bg-neon-green/10 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-neon-green/20 transition-colors">
                    <Monitor className="h-8 w-8 text-neon-green" />
                  </div>
                  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
                    Desktop
                  </span>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="w-16 h-16 bg-purple-400/10 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-purple-400/20 transition-colors">
                    <Tablet className="h-8 w-8 text-purple-400" />
                  </div>
                  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
                    Tablet
                  </span>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-cyan-400/20 transition-colors">
                    <Smartphone className="h-8 w-8 text-cyan-400" />
                  </div>
                  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
                    Mobile
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonial Strip */}
        <section className="py-16 bg-gradient-to-r from-neon-gray/10 to-transparent overflow-hidden">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Trusted by Digital Pioneers
            </h3>
            <p className="text-gray-400">
              Join thousands of users building the future of link sharing
            </p>
          </div>
          <div className="ticker-scroll flex space-x-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-gradient-to-br from-neon-gray/30 to-neon-dark/50 p-6 rounded-2xl border border-neon-green/20 min-w-[350px] backdrop-blur-sm hover:border-neon-green/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-green/20 to-emerald-400/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-neon-green" />
                  </div>
                  <div>
                    <div className="text-white font-bold">CyberUser{i + 1}</div>
                    <div className="text-neon-green/70 text-sm font-mono">
                      Ring Pioneer
                    </div>
                  </div>
                  <div className="flex ml-auto">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 text-neon-green fill-current"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "LinkRing transformed our team collaboration. The ephemeral
                  chat and rich embeds make sharing so much more engaging!"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section
          id="features"
          data-animate
          className="py-24 bg-gradient-to-b from-neon-gray/30 to-neon-dark relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #00FF9D 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #00FF9D 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/30 rounded-full px-6 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-neon-green animate-spin-slow" />
                <span className="text-neon-green font-medium text-sm">
                  Advanced Features
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white">
                Next-Gen{" "}
                <span className="text-transparent bg-gradient-to-r from-neon-green to-cyan-400 bg-clip-text">
                  Technology
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Experience the future of link sharing with cutting-edge features
                designed for the digital elite
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: Shield,
                  title: "Military-Grade Security",
                  description:
                    "End-to-end encryption protects your private circles from unauthorized access with quantum-resistant algorithms.",
                  color: "neon-green",
                  gradient: "from-neon-green/20 to-emerald-400/20",
                },
                {
                  icon: MessageCircle,
                  title: "Ephemeral Chat",
                  description:
                    "Real-time discussions that automatically delete after 16 hours, ensuring your conversations stay private.",
                  color: "purple-400",
                  gradient: "from-purple-400/20 to-pink-400/20",
                },
                {
                  icon: Play,
                  title: "Rich Media Embeds",
                  description:
                    "YouTube, Spotify, Twitter, Figma, and more embedded directly in your rings for seamless sharing.",
                  color: "cyan-400",
                  gradient: "from-cyan-400/20 to-blue-400/20",
                },
                {
                  icon: Users,
                  title: "Smart Invite System",
                  description:
                    "Generate unique codes and manage member permissions with granular access controls.",
                  color: "emerald-400",
                  gradient: "from-emerald-400/20 to-green-400/20",
                },
                {
                  icon: Wifi,
                  title: "Real-time Sync",
                  description:
                    "Lightning-fast synchronization ensures all members see updates instantly across all devices.",
                  color: "yellow-400",
                  gradient: "from-yellow-400/20 to-orange-400/20",
                },
                {
                  icon: Globe,
                  title: "Public & Private Rings",
                  description:
                    "Choose between private circles for your team or public rings to share knowledge with the world.",
                  color: "indigo-400",
                  gradient: "from-indigo-400/20 to-purple-400/20",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`group feature-card bg-gradient-to-br from-neon-gray/50 to-neon-dark/50 p-8 rounded-3xl border border-${feature.color}/20 hover:border-${feature.color}/50 hover:shadow-neon transition-all duration-500 cursor-pointer backdrop-blur-sm hover:scale-105`}
                >
                  <div
                    className={`h-20 w-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}
                  >
                    <feature.icon
                      className={`h-10 w-10 text-${feature.color} group-hover:animate-pulse`}
                    />
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-4 text-white group-hover:text-${feature.color} transition-colors duration-300`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                  <div
                    className={`mt-6 w-full h-1 bg-gradient-to-r from-${feature.color}/20 to-transparent rounded-full group-hover:from-${feature.color}/50 transition-all duration-300`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Active Users", color: "neon-green" },
                { number: "50K+", label: "Links Shared", color: "purple-400" },
                { number: "1K+", label: "Private Rings", color: "cyan-400" },
                { number: "99.9%", label: "Uptime", color: "emerald-400" },
              ].map((stat, i) => (
                <div key={i} className="group">
                  <div
                    className={`text-4xl md:text-5xl font-black text-${stat.color} mb-2 group-hover:animate-pulse`}
                  >
                    {stat.number}
                  </div>
                  <div className="text-gray-400 font-medium group-hover:text-white transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
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

        {/* Enhanced CTA Section */}
        <section className="py-32 bg-gradient-to-br from-neon-green/10 via-purple-500/5 to-cyan-400/10 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-green/5 to-transparent animate-pulse"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-green/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"></div>
          </div>

          <div className="max-w-6xl mx-auto text-center px-6 relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-neon-green/10 border border-neon-green/30 rounded-full px-6 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-neon-green animate-spin-slow" />
                <span className="text-neon-green font-medium text-sm">
                  Join the Revolution
                </span>
              </div>
            </div>

            <h2 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-none">
              <span className="text-white">Ready to Enter the</span>
              <br />
              <span className="text-transparent bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-400 bg-clip-text animate-gradient-text">
                Digital Ring
              </span>
              <span className="text-white">?</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
              Join thousands of digital pioneers who have already discovered the
              power of next-generation link sharing. Your private circle awaits.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-8 mb-16">
              <Link to="/signup">
                <Button className="group neon-button ripple-effect font-bold px-12 py-6 text-xl rounded-full transform hover:scale-105 transition-all duration-300 shadow-neon-lg hover:shadow-neon-xl relative overflow-hidden min-w-[250px]">
                  <span className="relative z-10 flex items-center justify-center">
                    Start Your Journey
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="group border-2 border-neon-green text-neon-green hover:bg-neon-green/10 font-bold px-12 py-6 text-xl transition-all duration-300 rounded-full transform hover:scale-105 hover:shadow-neon relative overflow-hidden min-w-[250px]"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <Lock className="mr-3 h-6 w-6" />
                    Access Ring
                  </span>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-80">
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold text-neon-green mb-2 group-hover:animate-pulse">
                  256-bit
                </div>
                <div className="text-gray-400 text-sm group-hover:text-white transition-colors">
                  Encryption
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:animate-pulse">
                  24/7
                </div>
                <div className="text-gray-400 text-sm group-hover:text-white transition-colors">
                  Support
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold text-cyan-400 mb-2 group-hover:animate-pulse">
                  99.9%
                </div>
                <div className="text-gray-400 text-sm group-hover:text-white transition-colors">
                  Uptime
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold text-emerald-400 mb-2 group-hover:animate-pulse">
                  GDPR
                </div>
                <div className="text-gray-400 text-sm group-hover:text-white transition-colors">
                  Compliant
                </div>
              </div>
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
