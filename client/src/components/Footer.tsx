import React from "react";
import { Link } from "wouter";
import { Mail, Phone, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-white font-bold text-2xl">Assist.ai</span>
            <p className="mt-2 text-gray-300 text-sm">
              Your personal AI assistant, backed by human expertise.
            </p>
            <div className="mt-4 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Services</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/#services" className="text-base text-gray-400 hover:text-white">
                  Administrative Support
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-base text-gray-400 hover:text-white">
                  Research & Analysis
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-base text-gray-400 hover:text-white">
                  Content Creation
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-base text-gray-400 hover:text-white">
                  Project Management
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/#about" className="text-base text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#blog" className="text-base text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/#careers" className="text-base text-gray-400 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-base text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-base text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/data-processing" className="text-base text-gray-400 hover:text-white">
                  Data Processing
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-base text-gray-400 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="mailto:contact@assist.ai" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Email</span>
              <Mail className="h-6 w-6" />
            </a>
            <a href="tel:+1234567890" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Phone</span>
              <Phone className="h-6 w-6" />
            </a>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} Assist.ai, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
