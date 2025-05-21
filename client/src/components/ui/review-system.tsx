import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, AlertCircle, X, DollarSign, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ReviewSystemProps {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  requestStatus: string;
  aiAnalysis: any;
}

export function ReviewSystem({ 
  requestId, 
  requestTitle, 
  requestDescription, 
  requestStatus,
  aiAnalysis 
}: ReviewSystemProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewState, setReviewState] = useState<"awaiting_review" | "reviewed" | "confirmed">(
    requestStatus === "pending" ? "awaiting_review" : "reviewed"
  );
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [adjustedEstimate, setAdjustedEstimate] = useState(aiAnalysis ? {
    timeframe: {
      min: Math.round(aiAnalysis.plan.reduce((sum, step) => sum + step.estimatedHours, 0) * 0.9),
      max: Math.round(aiAnalysis.plan.reduce((sum, step) => sum + step.estimatedHours, 0) * 1.2)
    },
    costRange: {
      min: aiAnalysis.costEstimateRange.min,
      max: aiAnalysis.costEstimateRange.max
    }
  } : null);
  
  const { toast } = useToast();

  const handleSubmitReview = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide some feedback about this request.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to submit review
      // In a real implementation, this would send the review to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state after "successful" submission
      setReviewState("reviewed");
      setReviewFeedback(feedback);
      
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReview = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call to confirm review
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update state after "successful" confirmation
      setReviewState("confirmed");
      
      toast({
        title: "Contract Confirmed",
        description: "The contract has been confirmed and is ready for customer approval.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm contract. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Human team review form
  if (reviewState === "awaiting_review") {
    return (
      <Card className="border-yellow-200">
        <CardHeader className="bg-yellow-50 border-b border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                Request Review Required
              </CardTitle>
              <CardDescription>
                This request needs human review before proceeding
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Awaiting Review
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Human Assistance Team Review</h3>
            <p className="text-sm text-gray-600">
              Please review this request to verify if it's doable within the estimated timeframe and budget. 
              Provide feedback and adjust estimates if necessary.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Current AI Estimates:</h4>
                <div className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {aiAnalysis ? (
                        <>Estimated Time: {aiAnalysis.plan.reduce((sum, step) => sum + step.estimatedHours, 0)} hours</>
                      ) : "No time estimate available"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {aiAnalysis ? (
                        <>Estimated Cost: ${aiAnalysis.costEstimateRange.min} - ${aiAnalysis.costEstimateRange.max}</>
                      ) : "No cost estimate available"}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Request Details:</h4>
                <p className="mt-2 text-sm text-gray-600">{requestDescription}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                Your Feedback
              </label>
              <Textarea
                id="feedback"
                placeholder="Provide your assessment of this request, including whether it's doable, any concerns, and your adjusted estimates if needed..."
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t flex justify-end space-x-2 p-4">
          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting || !feedback.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Submitting Review...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // After human review - showing the feedback
  if (reviewState === "reviewed") {
    return (
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-500" />
                Human Review Completed
              </CardTitle>
              <CardDescription>
                This request has been reviewed by our team
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              Reviewed
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle>Request Reviewed</AlertTitle>
              <AlertDescription>
                Our human assistance team has reviewed your request and provided feedback.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Team Feedback:</h4>
                <p className="mt-2 text-sm text-gray-600">{reviewFeedback || "This request has been reviewed and is ready to proceed."}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Adjusted Estimates:</h4>
                <div className="mt-2 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {adjustedEstimate ? (
                        <>Timeframe: {adjustedEstimate.timeframe.min}-{adjustedEstimate.timeframe.max} hours</>
                      ) : "No time estimate available"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {adjustedEstimate ? (
                        <>Cost Range: ${adjustedEstimate.costRange.min}-${adjustedEstimate.costRange.max}</>
                      ) : "No cost estimate available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 border-t flex justify-end space-x-2 p-4">
          <Button
            variant="outline"
            onClick={() => setReviewState("awaiting_review")}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Revise Review
          </Button>
          
          <Button
            onClick={handleConfirmReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm & Generate Contract
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // After confirmation - final state
  return (
    <Card className="border-green-200">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Review Confirmed
            </CardTitle>
            <CardDescription>
              This request has been reviewed and confirmed
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Confirmed
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Ready for Contract</AlertTitle>
            <AlertDescription>
              The request has been confirmed and is ready for the client to review and approve the contract.
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Final Estimates:</h4>
              <div className="mt-2 flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {adjustedEstimate ? (
                      <>Timeframe: {adjustedEstimate.timeframe.min}-{adjustedEstimate.timeframe.max} hours</>
                    ) : "No time estimate available"}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {adjustedEstimate ? (
                      <>Cost Range: ${adjustedEstimate.costRange.min}-${adjustedEstimate.costRange.max}</>
                    ) : "No cost estimate available"}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Next Steps:</h4>
              <p className="mt-2 text-sm text-gray-600">
                Please generate a contract for the client to review using the Contract tab. 
                Once the contract is generated, the client will be able to review and approve it.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}