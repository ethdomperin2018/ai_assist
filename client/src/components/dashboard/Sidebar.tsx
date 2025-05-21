import React, { useContext } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Settings, 
  CreditCard, 
  LogOut, 
  User
} from "lucide-react";
import { AuthContext, AuthContextType } from "../../App";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [location] = useLocation();
  const auth = useContext(AuthContext) as AuthContextType;
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, title: "Dashboard", path: "/dashboard" },
    { icon: <MessageSquare className="h-5 w-5" />, title: "Messages", path: "/messages" },
    { icon: <FileText className="h-5 w-5" />, title: "Contracts", path: "/contracts" },
    { icon: <Calendar className="h-5 w-5" />, title: "Meetings", path: "/meetings" },
    { icon: <CreditCard className="h-5 w-5" />, title: "Billing", path: "/billing" },
    { icon: <Settings className="h-5 w-5" />, title: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-10 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-800">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/">
            <a className="text-primary-600 dark:text-primary-400 font-bold text-2xl">Assist.ai</a>
          </Link>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </a>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {auth.user?.fullName || "User"}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {auth.user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3 text-gray-600 dark:text-gray-300 justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
