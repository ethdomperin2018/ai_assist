import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Request {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  aiPlan?: any;
}

interface RequestCardProps {
  request: Request;
}

export default function RequestCard({ request }: RequestCardProps) {
  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const getStatusBadge = (status: string) => {
    const formattedStatus = status.replace("_", " ");
    return (
      <Badge className={statusColor[status] || ""}>
        {formattedStatus.charAt(0).toUpperCase() + formattedStatus.slice(1)}
      </Badge>
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100">
              {truncateText(request.title, 30)}
            </h3>
            {getStatusBadge(request.status)}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {truncateText(request.description, 100)}
          </p>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              Created {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </span>
          </div>
          {request.aiPlan && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{request.aiPlan.plan.length} steps planned</span>
              </div>
              <div className="mt-1">
                Est. Cost: ${request.aiPlan.costEstimateRange.min / 100} - ${request.aiPlan.costEstimateRange.max / 100}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-800">
        <Link href={`/request/${request.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
