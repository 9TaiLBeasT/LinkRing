import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  FolderKanban,
  Search,
  BarChart3,
  Zap,
  Plus,
  UserPlus,
} from "lucide-react";
import { useRings } from "@/hooks/useRings";
import CreateRingDialog from "../CreateRingDialog";
import JoinRingDialog from "../JoinRingDialog";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface SidebarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const defaultNavItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard", isActive: true },
  { icon: <Search size={20} />, label: "Explore" },
  { icon: <BarChart3 size={20} />, label: "Leaderboard" },
  { icon: <Settings size={20} />, label: "Settings" },
];

const defaultBottomItems: NavItem[] = [
  { icon: <Settings size={20} />, label: "Settings" },
  { icon: <HelpCircle size={20} />, label: "Help" },
];

const Sidebar = ({
  items = defaultNavItems,
  activeItem = "Dashboard",
  onItemClick = () => {},
}: SidebarProps) => {
  const { rings, loading } = useRings();
  const navigate = useNavigate();
  return (
    <div className="w-[280px] h-full bg-neon-dark/95 backdrop-blur-md border-r border-neon-green/20 flex flex-col font-mono">
      <div className="p-6">
        <h2
          className="text-xl font-bold mb-2 text-neon-green glitch-text"
          data-text="LinkRing"
        >
          LinkRing
        </h2>
        <p className="text-sm text-gray-400">
          Navigate the digital underground
        </p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.label} className="relative group">
              <Button
                variant={"ghost"}
                className={`w-full justify-start gap-3 h-12 rounded-xl text-sm font-medium transition-all duration-300 ${
                  item.label === activeItem
                    ? "bg-neon-green/10 text-neon-green border border-neon-green/30 shadow-neon"
                    : "text-gray-300 hover:bg-neon-green/5 hover:text-neon-green border border-transparent"
                }`}
                onClick={() => onItemClick(item.label)}
              >
                <span
                  className={`transition-all duration-300 ${
                    item.label === activeItem
                      ? "text-neon-green animate-pulse"
                      : "text-gray-400 group-hover:text-neon-green"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Button>

              {/* Slide-in hover submenu */}
              {item.label === "Dashboard" && (
                <div className="absolute left-full top-0 ml-2 w-48 bg-neon-gray/90 backdrop-blur-md border border-neon-green/20 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs text-neon-green/70 font-medium">
                      Quick Actions
                    </div>
                    <CreateRingDialog>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs text-gray-300 hover:text-neon-green hover:bg-neon-green/10"
                      >
                        <Zap className="h-3 w-3 mr-2" />
                        Create Ring
                      </Button>
                    </CreateRingDialog>
                    <JoinRingDialog>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs text-gray-300 hover:text-neon-green hover:bg-neon-green/10"
                      >
                        <Users className="h-3 w-3 mr-2" />
                        Join Ring
                      </Button>
                    </JoinRingDialog>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-6 bg-neon-green/20" />

        <div className="space-y-3">
          <h3 className="text-xs font-medium px-4 py-1 text-neon-green/70 uppercase tracking-wider">
            Your Rings
          </h3>
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-4 w-4 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
              </div>
            ) : rings.length > 0 ? (
              rings.slice(0, 5).map((ring, index) => {
                const colors = [
                  "bg-neon-green",
                  "bg-yellow-500",
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-pink-500",
                ];
                const color = colors[index % colors.length];

                return (
                  <Button
                    key={ring.id}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium text-gray-300 hover:bg-neon-green/5 hover:text-neon-green"
                    title={ring.name}
                    onClick={() => navigate(`/ring/${ring.id}`)}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${color} animate-pulse`}
                      style={{ animationDelay: `${index * 0.5}s` }}
                    ></span>
                    <span className="truncate flex-1 text-left">
                      {ring.name}
                    </span>
                    <span className="ml-auto text-xs text-neon-green/60">
                      {ring.member_count || 0}
                    </span>
                  </Button>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No rings yet
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-neon-green/20">
        <div className="flex gap-2 mb-4">
          <CreateRingDialog>
            <Button className="neon-button flex-1 h-10 rounded-xl font-bold text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </CreateRingDialog>
          <JoinRingDialog>
            <Button className="neon-button flex-1 h-10 rounded-xl font-bold text-sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Join
            </Button>
          </JoinRingDialog>
        </div>
        {defaultBottomItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium text-gray-300 hover:bg-neon-green/5 hover:text-neon-green mb-1.5 transition-all duration-300"
            onClick={() => onItemClick(item.label)}
          >
            <span className="text-gray-400">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
