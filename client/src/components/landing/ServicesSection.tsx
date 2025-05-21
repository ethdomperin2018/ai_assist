import React from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  Search, 
  FileEdit, 
  Clipboard, 
  Code, 
  User
} from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      icon: <Calendar />,
      title: "Administrative Support",
      description: "Email management, scheduling, travel arrangements, data entry, and more.",
      link: "#administrative-support"
    },
    {
      icon: <Search />,
      title: "Research & Analysis",
      description: "Market research, competitive analysis, data gathering, and information verification.",
      link: "#research-analysis"
    },
    {
      icon: <FileEdit />,
      title: "Content Creation",
      description: "Writing, editing, proofreading, social media content, and presentation design.",
      link: "#content-creation"
    },
    {
      icon: <Clipboard />,
      title: "Project Management",
      description: "Task coordination, deadline tracking, team communication, and progress reporting.",
      link: "#project-management"
    },
    {
      icon: <Code />,
      title: "Technical Support",
      description: "Software setup, troubleshooting, technology recommendation, and basic coding tasks.",
      link: "#technical-support"
    },
    {
      icon: <User />,
      title: "Personal Services",
      description: "Gift shopping, event planning, reservation making, and personal shopping.",
      link: "#personal-services"
    }
  ];

  return (
    <div className="py-16 bg-white dark:bg-gray-900" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">Our Services</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            What We Can Do For You
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            From simple tasks to complex projects, our AI and human team can handle a wide range of personal and business needs.
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 p-2 inline-block mb-4">
                  {service.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{service.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{service.description}</p>
                <div className="mt-4">
                  <Link href={service.link}>
                    <a className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                      Learn more &rarr;
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
