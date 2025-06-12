import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import DashboardGrid from "../dashboard/DashboardGrid";
import TaskBoard from "../dashboard/TaskBoard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const Home = () => {
  const [loading, setLoading] = useState(false);

  // Function to trigger loading state for demonstration
  const handleRefresh = () => {
    setLoading(true);
    // Reset loading after 2 seconds
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  return (
    <div className="min-h-screen bg-neon-dark">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className={cn("transition-all duration-300 ease-in-out")}>
            <DashboardGrid isLoading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
