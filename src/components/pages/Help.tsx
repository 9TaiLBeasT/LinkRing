import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Book,
  Video,
  Mail,
  ExternalLink,
  ChevronRight,
  Users,
  Link as LinkIcon,
  Shield,
  Settings,
  Zap,
  Star,
  Globe,
  Download,
  FileText,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import Sidebar, { SidebarToggle } from "../dashboard/layout/Sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
  category: string;
}

const Help = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [supportTicket, setSupportTicket] = useState<SupportTicket>({
    subject: "",
    description: "",
    priority: "medium",
    category: "general",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "What is LinkRing and how does it work?",
      answer:
        "LinkRing is a private link-sharing platform that allows you to create exclusive circles (rings) for sharing and discovering content. You can create rings with friends, colleagues, or communities to share links, articles, videos, and other digital content in a curated environment.",
      category: "getting-started",
    },
    {
      id: "2",
      question: "How do I create a new ring?",
      answer:
        "To create a new ring, click the 'Create' button in the sidebar or use the 'Create New Ring' button on your dashboard. Enter a name for your ring, add a description, and configure privacy settings. You can then invite members using the generated invite code.",
      category: "rings",
    },
    {
      id: "3",
      question: "How do I join an existing ring?",
      answer:
        "To join a ring, you need an invite code from the ring creator or an existing member. Click the 'Join' button in the sidebar, enter the invite code, and you'll be added to the ring if the code is valid.",
      category: "rings",
    },
    {
      id: "4",
      question: "Can I share links from any website?",
      answer:
        "Yes, you can share links from any publicly accessible website. Simply paste the URL when creating a new post, and LinkRing will automatically fetch the title, description, and preview image when available.",
      category: "sharing",
    },
    {
      id: "5",
      question: "How do I save links for later?",
      answer:
        "Click the bookmark icon on any shared link to save it to your personal collection. You can access all your saved links from the 'Saved Links' section in the sidebar.",
      category: "sharing",
    },
    {
      id: "6",
      question: "What are the privacy settings for rings?",
      answer:
        "Rings can be set to private (invite-only) or public (discoverable). Private rings require an invite code to join, while public rings can be found through the Explore section. Ring creators can change these settings at any time.",
      category: "privacy",
    },
    {
      id: "7",
      question: "How does the leaderboard work?",
      answer:
        "The leaderboard ranks users based on their activity and engagement within rings. Points are earned by sharing quality links, receiving upvotes, and active participation. Rankings are updated weekly.",
      category: "features",
    },
    {
      id: "8",
      question: "Can I customize my profile?",
      answer:
        "Yes, you can customize your profile by going to Settings. You can update your display name, username, bio, and choose from different themes and font styles to personalize your experience.",
      category: "account",
    },
    {
      id: "9",
      question: "How do I delete my account?",
      answer:
        "To delete your account, go to Settings > Danger Zone. You'll need to type 'DELETE MY ACCOUNT' to confirm. This action is irreversible and will permanently remove all your data.",
      category: "account",
    },
    {
      id: "10",
      question: "Is my data secure?",
      answer:
        "Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your personal information with third parties without your consent.",
      category: "privacy",
    },
  ];

  const categories = [
    { id: "all", name: "All Topics", icon: <Book className="h-4 w-4" /> },
    {
      id: "getting-started",
      name: "Getting Started",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: "rings",
      name: "Rings & Communities",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "sharing",
      name: "Sharing & Links",
      icon: <LinkIcon className="h-4 w-4" />,
    },
    { id: "features", name: "Features", icon: <Star className="h-4 w-4" /> },
    {
      id: "account",
      name: "Account Settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "privacy",
      name: "Privacy & Security",
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const submitSupportTicket = async () => {
    if (!user || !supportTicket.subject || !supportTicket.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd send this to your support system
      // For now, we'll just simulate the submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Support Ticket Submitted",
        description: "We'll get back to you within 24 hours.",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });

      setSupportTicket({
        subject: "",
        description: "",
        priority: "medium",
        category: "general",
      });
      setShowContactDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using LinkRing",
      icon: <Book className="h-6 w-6" />,
      action: () => {
        setSelectedCategory("getting-started");
        setSearchQuery("");
        // Scroll to FAQ section
        setTimeout(() => {
          const faqSection = document.querySelector('[data-section="faq"]');
          if (faqSection) {
            faqSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      },
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: <Video className="h-6 w-6" />,
      action: () =>
        window.open("https://youtube.com/linkring-tutorials", "_blank"),
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: <MessageCircle className="h-6 w-6" />,
      action: () => setShowContactDialog(true),
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: <Users className="h-6 w-6" />,
      action: () => {
        // For demo purposes, show a toast since the forum doesn't exist yet
        toast({
          title: "Community Forum",
          description:
            "Community forum coming soon! For now, you can contact support for help.",
          className: "bg-neon-dark border-neon-green text-neon-green",
        });
      },
    },
  ];

  return (
    <div className="min-h-screen bg-neon-dark">
      <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : sidebarOpen ? "ml-0" : "-ml-[280px]",
          )}
        >
          <div
            className={cn(
              "transition-all duration-300 ease-in-out text-white font-mono",
              isMobile ? "px-4 pt-16" : "px-6 pt-6",
            )}
          >
            <div className="container mx-auto py-8 max-w-6xl">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1
                  className="text-4xl font-bold text-neon-green glitch-text mb-2"
                  data-text="Help Center"
                >
                  Help Center
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-neon-green to-transparent mx-auto animate-pulse" />
                <p className="text-gray-400 mt-4">
                  Find answers, tutorials, and get support for your LinkRing
                  experience
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action, index) => (
                  <Card
                    key={index}
                    className="bg-neon-dark border-neon-green/30 hover:border-neon-green/50 transition-all duration-300 cursor-pointer group"
                    onClick={action.action}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-neon-green mb-3 group-hover:animate-pulse">
                        {action.icon}
                      </div>
                      <h3 className="text-neon-green font-semibold mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="bg-neon-dark border-neon-green/30 sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-neon-green font-mono flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategory === category.id
                              ? "default"
                              : "ghost"
                          }
                          className={cn(
                            "w-full justify-start gap-2 text-sm",
                            selectedCategory === category.id
                              ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                              : "text-gray-300 hover:text-neon-green hover:bg-neon-green/5",
                          )}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.icon}
                          {category.name}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  {/* Search */}
                  <Card className="bg-neon-dark border-neon-green/30 mb-6">
                    <CardContent className="p-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search help articles..."
                          className="neon-input pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQ Section */}
                  <Card
                    className="bg-neon-dark border-neon-green/30"
                    data-section="faq"
                  >
                    <CardHeader>
                      <CardTitle className="text-neon-green font-mono flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Frequently Asked Questions
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {filteredFAQs.length} article
                        {filteredFAQs.length !== 1 ? "s" : ""} found
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredFAQs.length > 0 ? (
                        <Accordion
                          type="single"
                          collapsible
                          className="space-y-2"
                        >
                          {filteredFAQs.map((faq) => (
                            <AccordionItem
                              key={faq.id}
                              value={faq.id}
                              className="border border-neon-green/20 rounded-lg px-4 data-[state=open]:border-neon-green/50"
                            >
                              <AccordionTrigger className="text-neon-green hover:text-neon-green/80 text-left">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-300 pt-2 pb-4">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="text-center py-12">
                          <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 mb-2">
                            No articles found
                          </p>
                          <p className="text-gray-500 text-sm">
                            Try adjusting your search terms or category filter
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Additional Resources */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-neon-dark border-neon-green/30">
                      <CardHeader>
                        <CardTitle className="text-neon-green font-mono flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-gray-300 hover:text-neon-green"
                          onClick={() =>
                            window.open("https://docs.linkring.app", "_blank")
                          }
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documentation
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-gray-300 hover:text-neon-green"
                          onClick={() =>
                            window.open("https://api.linkring.app", "_blank")
                          }
                        >
                          <span className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            API Reference
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-gray-300 hover:text-neon-green"
                          onClick={() =>
                            window.open("https://status.linkring.app", "_blank")
                          }
                        >
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            System Status
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-neon-dark border-neon-green/30">
                      <CardHeader>
                        <CardTitle className="text-neon-green font-mono flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Contact Us
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Mail className="h-4 w-4 text-neon-green" />
                          <span className="text-sm">support@linkring.app</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Clock className="h-4 w-4 text-neon-green" />
                          <span className="text-sm">
                            Response time: 24 hours
                          </span>
                        </div>
                        <Button
                          className="neon-button w-full"
                          onClick={() => setShowContactDialog(true)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Submit Ticket
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Contact Support Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="bg-neon-dark border-neon-green/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-neon-green flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Describe your issue and we'll get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neon-green mb-2">
                Subject *
              </label>
              <Input
                className="neon-input"
                value={supportTicket.subject}
                onChange={(e) =>
                  setSupportTicket((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                placeholder="Brief description of your issue"
              />
            </div>
            <div>
              <label className="block text-sm text-neon-green mb-2">
                Category
              </label>
              <select
                className="w-full p-2 bg-neon-gray border border-neon-green/30 rounded-lg text-white"
                value={supportTicket.category}
                onChange={(e) =>
                  setSupportTicket((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account Problem</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-neon-green mb-2">
                Priority
              </label>
              <select
                className="w-full p-2 bg-neon-gray border border-neon-green/30 rounded-lg text-white"
                value={supportTicket.priority}
                onChange={(e) =>
                  setSupportTicket((prev) => ({
                    ...prev,
                    priority: e.target.value as "low" | "medium" | "high",
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-neon-green mb-2">
                Description *
              </label>
              <textarea
                className="w-full p-2 bg-neon-gray border border-neon-green/30 rounded-lg text-white min-h-[100px] resize-none"
                value={supportTicket.description}
                onChange={(e) =>
                  setSupportTicket((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Please provide as much detail as possible..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowContactDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="neon-button flex-1"
                onClick={submitSupportTicket}
                disabled={
                  loading ||
                  !supportTicket.subject ||
                  !supportTicket.description
                }
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Help;
