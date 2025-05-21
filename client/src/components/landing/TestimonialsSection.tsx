import React from "react";
import { Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Assist.ai has transformed how our executive team operates. Their combination of AI and human expertise has saved us countless hours on administrative tasks and research.",
      author: "Sarah Johnson",
      role: "CEO, TechStart"
    },
    {
      quote: "As a solo entrepreneur, I can't afford to hire multiple specialists. Assist.ai gives me access to a full team of experts at a fraction of the cost. It's like having a personal assistant, researcher, and project manager all in one.",
      author: "Michael Chen",
      role: "Freelance Designer"
    },
    {
      quote: "The confidentiality and security of Assist.ai's platform gives me peace of mind when handling sensitive client information. Their AI helps with initial research, and their human team delivers polished, professional results.",
      author: "Emily Rodriguez",
      role: "Attorney"
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-16" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            What Our Clients Say
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 mr-4"></div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{testimonial.author}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="relative">
                <Quote className="absolute top-0 left-0 transform -translate-x-3 -translate-y-2 h-8 w-8 text-gray-200 dark:text-gray-700" />
                <p className="relative text-gray-600 dark:text-gray-400 ml-6">
                  {testimonial.quote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
