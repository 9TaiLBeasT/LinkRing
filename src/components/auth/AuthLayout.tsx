import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
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
          <nav className="hidden md:flex items-center space-x-7 text-sm font-light">
            <Link
              to="/"
              className="text-gray-300 hover:text-neon-green transition-colors"
            >
              Features
            </Link>
            <Link
              to="/"
              className="text-gray-300 hover:text-neon-green transition-colors"
            >
              Security
            </Link>
            <Link
              to="/"
              className="text-gray-300 hover:text-neon-green transition-colors"
            >
              API
            </Link>
            <Link
              to="/"
              className="text-gray-300 hover:text-neon-green transition-colors"
            >
              Community
            </Link>
            <Link
              to="/"
              className="text-gray-300 hover:text-neon-green transition-colors"
            >
              Support
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2
              className="text-4xl font-bold tracking-tight text-white glitch-text"
              data-text="LinkRing"
            >
              Link<span className="text-neon-green">Ring</span>
            </h2>
            <p className="text-xl font-medium text-neon-green/70 mt-2">
              Enter the digital underground
            </p>
          </div>
          {children}
        </div>
      </div>

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-1 h-1 bg-neon-green rounded-full animate-pulse"></div>
        <div
          className="absolute top-1/3 right-20 w-2 h-2 bg-neon-green rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-1 h-1 bg-neon-green rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
    </div>
  );
}
