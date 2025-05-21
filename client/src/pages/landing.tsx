import React from "react";
import Header from "../components/Header";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import DemoChat from "../components/landing/DemoChat";
import ServicesSection from "../components/landing/ServicesSection";
import PricingSection from "../components/landing/PricingSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/Footer";
import { useTitle } from "../hooks/useTitle";

export default function Landing() {
  useTitle("Assist.ai - Personal Assistance Company");

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Features />
      <DemoChat />
      <ServicesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
