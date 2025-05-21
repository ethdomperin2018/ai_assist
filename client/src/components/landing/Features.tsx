import React from "react";
import { MessageSquare, ClipboardCheck, Users, Shield } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Natural Language Requests",
      description: "Simply tell our AI what you need in everyday language. No need to figure out how to categorize your request."
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Solution Planning",
      description: "Our AI analyzes your request and creates a step-by-step plan, identifying which parts it can handle and which need human expertise."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Human Expert Collaboration",
      description: "Our skilled team works alongside the AI to execute complex tasks that require human judgment, creativity, or specialized knowledge."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Complete Confidentiality",
      description: "Your data and requests are kept strictly confidential with enterprise-grade security and privacy protections."
    }
  ];

  return (
    <div className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">How It Works</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            AI-Powered Personal Assistance
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            Our service combines advanced AI with human expertise to handle any task you need completed.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">{feature.title}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
