import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32 lg:max-w-2xl">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 xl:mt-28">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Your Personal AI</span>
                <span className="block text-primary-600 dark:text-primary-400">Assistant Team</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                We handle your tasks with our AI-powered platform supported by human experts. Just ask for help, and we'll take care of the rest.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href="/register">
                    <Button size="lg" className="w-full px-8 py-3 md:py-4 md:text-lg md:px-10">
                      Get Started
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="#demo-chat">
                    <Button variant="outline" size="lg" className="w-full px-8 py-3 md:py-4 md:text-lg md:px-10">
                      Chat with AI
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 hidden lg:block">
        <div className="relative h-full w-full">
          {/* Gradient overlay for visual interest */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-700/30 mix-blend-overlay z-10 rounded-l-3xl"></div>
          
          <img 
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full rounded-l-3xl shadow-2xl" 
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900&q=80" 
            alt="AI assistant working with human team" 
          />
          
          {/* Modern decorative elements */}
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary-500/20 rounded-full blur-xl"></div>
          <div className="absolute top-10 right-10 w-16 h-16 bg-primary-300/30 rounded-full blur-lg"></div>
        </div>
      </div>
    </div>
  );
}
