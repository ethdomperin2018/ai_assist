import React, { useContext, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { AuthContext, AuthContextType } from "../App";
import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const auth = useContext(AuthContext);
  // Provide default values if auth context is not available yet
  const isAuthenticated = auth?.isAuthenticated || false;
  const { theme, setTheme } = useTheme();
  
  const isActive = (path: string) => location === path;
  
  const menuItems = [
    { title: "Home", path: "/" },
    { title: "How It Works", path: "/#how-it-works" },
    { title: "Pricing", path: "/#pricing" },
    { title: "About Us", path: "/#about-us" },
  ];
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-2xl">Assist.ai</span>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(item.path) 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="outline" className="hidden md:block">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-500 dark:text-gray-400 font-medium hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 hidden md:block">
                  Log In
                </Link>
                <Link href="/register">
                  <Button className="hidden md:block">
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6 pt-4">
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">Assist.ai</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    {menuItems.map((item) => (
                      <Link 
                        key={item.path} 
                        href={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`py-2 px-3 rounded-md ${
                          isActive(item.path) 
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    {isAuthenticated ? (
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Log In
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                          <Button className="w-full">
                            Start Free Trial
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
