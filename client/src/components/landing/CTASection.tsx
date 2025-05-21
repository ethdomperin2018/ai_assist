import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <div className="bg-primary-700 dark:bg-primary-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-100">
            Sign up for a free trial today. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link href="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-primary-600 dark:text-primary-900 bg-white dark:bg-gray-100 hover:bg-gray-50 dark:hover:bg-white border-transparent"
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex">
              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white bg-primary-600 hover:bg-primary-500 dark:bg-primary-800 dark:hover:bg-primary-700 border-white dark:border-gray-100"
                >
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
