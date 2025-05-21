import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";

export default function PricingSection() {
  const plans = [
    {
      name: "Basic",
      description: "Perfect for occasional assistance needs.",
      price: 49,
      period: "month",
      features: [
        "5 hours of AI assistance",
        "2 hours of human expert time",
        "Email & chat support",
        "72-hour response time"
      ],
      popular: false,
      cta: "Get started",
      ctaVariant: "outline" as const
    },
    {
      name: "Professional",
      description: "For businesses and busy professionals.",
      price: 199,
      period: "month",
      features: [
        "Unlimited AI assistance",
        "10 hours of human expert time",
        "Priority email & chat support",
        "24-hour response time",
        "Dedicated account manager"
      ],
      popular: true,
      cta: "Get started",
      ctaVariant: "default" as const
    },
    {
      name: "Enterprise",
      description: "For organizations with advanced needs.",
      price: null,
      customPrice: "Custom",
      period: null,
      features: [
        "Unlimited AI assistance",
        "Custom human expert hours",
        "24/7 priority support",
        "API integration",
        "Custom SLA"
      ],
      popular: false,
      cta: "Contact sales",
      ctaVariant: "outline" as const
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Simple, Transparent Pricing
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Choose the plan that's right for you, or pay only for what you need.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`border ${plan.popular ? 'border-2 border-primary-500' : 'border-gray-200 dark:border-gray-700'} rounded-lg ${plan.popular ? 'shadow-md' : 'shadow-sm'} p-6 bg-white dark:bg-gray-800 relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                  <div className="inline-block px-4 py-1 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{plan.name}</h3>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
              <p className="mt-8">
                {plan.price ? (
                  <>
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${plan.price}</span>
                    {plan.period && <span className="text-base font-medium text-gray-500 dark:text-gray-400">/{plan.period}</span>}
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{plan.customPrice}</span>
                )}
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-6 w-6 text-green-500 dark:text-green-400" />
                    </div>
                    <p className="ml-3 text-base text-gray-700 dark:text-gray-300">{feature}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <Button
                    variant={plan.ctaVariant}
                    className="w-full block text-center"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-base text-gray-500 dark:text-gray-400">
            Need a different option? <a href="#contact" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">Contact us</a> for custom pricing.
          </p>
        </div>
      </div>
    </div>
  );
}
