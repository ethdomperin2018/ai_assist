import React, { useContext, useState, useEffect } from "react";
import { useLocation, useParams, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ClipboardCheck, MessageSquare, FileText, ArrowLeft, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ChatUI, Message } from "@/components/ui/chat-ui";
import { ContractGenerator } from "@/components/ui/contract-generator";
import { ReviewSystem } from "@/components/ui/review-system";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { analyzeRequest, draftContract, AiAnalysisResponse } from "@/lib/openai";
import { AuthContext, AuthContextType } from "../App";
import Sidebar from "@/components/dashboard/Sidebar";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useTitle } from "../hooks/useTitle";

export default function Request() {
  const params = useParams();
  const [match, params2] = useRoute("/request/new");
  const [location, navigate] = useLocation();
  const auth = useContext(AuthContext);
  // Provide default values if auth context is not available yet
  const isAuthenticated = auth?.isAuthenticated || false;
  const { toast } = useToast();

  const isNewRequest = match || params.id === "new";
  useTitle(isNewRequest ? "New Request | Assist.ai" : "Request Details | Assist.ai");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contractDetails, setContractDetails] = useState("");
  const [contractContent, setContractContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch request if editing
  const { data: request, isLoading: isLoadingRequest } = useQuery({
    queryKey: [`/api/requests/${params.id}`],
    enabled: !isNewRequest && isAuthenticated,
  });

  // Fetch messages if editing
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/requests/${params.id}/messages`],
    enabled: !isNewRequest && isAuthenticated,
  });

  // Fetch steps if editing
  const { data: steps, isLoading: isLoadingSteps } = useQuery({
    queryKey: [`/api/requests/${params.id}/steps`],
    enabled: !isNewRequest && isAuthenticated,
  });

  useEffect(() => {
    // Check authentication status
    const isLoading = auth?.isLoading || false;
    if (!isLoading && !isAuthenticated) {
      navigate("/login?redirect=" + encodeURIComponent(location));
    }
  }, [auth, isAuthenticated, navigate, location]);

  useEffect(() => {
    if (request) {
      setTitle(request.title);
      setDescription(request.description);
      if (request.aiPlan) {
        setAiAnalysis(request.aiPlan);
      }
    }
  }, [request]);

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/requests", {
        title,
        description,
        aiPlan: aiAnalysis,
        status: "pending"
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Request Created",
        description: "Your request has been created successfully.",
      });
      navigate(`/request/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const draftContractMutation = useMutation({
    mutationFn: async () => {
      if (!params.id) throw new Error("Request ID is required");
      return await draftContract(parseInt(params.id), contractDetails);
    },
    onSuccess: (data) => {
      setContractContent(data.contractContent);
      toast({
        title: "Contract Drafted",
        description: "Your contract has been drafted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to draft contract. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both title and description for your request.",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      createRequestMutation.mutate();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzeRequest = async () => {
    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a description of your request for analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeRequest(description);
      setAiAnalysis(analysis);
      toast({
        title: "Analysis Complete",
        description: "Your request has been analyzed.",
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments", {
        requestId: parseInt(params.id),
        amount: aiAnalysis?.costEstimateRange.min || 5000, // In cents
        paymentMethod: "credit_card",
        status: "pending"
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/requests/${params.id}`] });
      toast({
        title: "Payment Processed",
        description: "Your payment has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitPayment = () => {
    submitPaymentMutation.mutate();
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-sm text-gray-500">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null; // Will redirect in the useEffect hook
  }

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        {isNewRequest ? (
          <Card>
            <CardHeader>
              <CardTitle>New Request</CardTitle>
              <CardDescription>
                Tell us what you need help with and our AI will analyze your request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <Input
                    id="title"
                    placeholder="E.g., Social Media Management, Research Project, Website Design"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <p className="text-sm text-gray-500 mb-2">
                    Be as detailed as possible. Include goals, timelines, and any specific requirements. Our AI will analyze your request and create a tailored plan.
                  </p>
                  <Textarea
                    id="description"
                    placeholder="E.g., I need help managing my company's social media accounts across Instagram, Twitter, and LinkedIn. I want to post 3 times per week on each platform, engage with followers, and grow my audience. I'm in the fitness industry..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[200px] w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handleAnalyzeRequest}
                    disabled={isAnalyzing || !description.trim() || description.length < 30}
                    className="w-full"
                    variant="outline"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI is analyzing your request...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <path d="M12 17h.01"></path>
                        </svg>
                        Analyze Request with AI
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Our AI will analyze your request and create a detailed plan with time estimates and cost range
                  </p>
                </div>

                {aiAnalysis && (
                  <Card className="mt-6 border-primary-200">
                    <CardHeader className="bg-primary-50 text-primary-900">
                      <CardTitle className="text-lg">AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2 text-primary-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <line x1="9" y1="9" x2="15" y2="9"/>
                              <line x1="9" y1="12" x2="15" y2="12"/>
                              <line x1="9" y1="15" x2="13" y2="15"/>
                            </svg>
                            Summary
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <p className="text-gray-700">{aiAnalysis.summary}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-primary-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                              <path d="M8 14h.01"/>
                              <path d="M12 14h.01"/>
                              <path d="M16 14h.01"/>
                              <path d="M8 18h.01"/>
                              <path d="M12 18h.01"/>
                              <path d="M16 18h.01"/>
                            </svg>
                            Implementation Plan
                          </h4>
                          <div className="bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                              {aiAnalysis.plan.map((step, index) => (
                                <li key={index} className="p-4 flex items-start hover:bg-gray-100 transition-colors">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center mr-3 font-medium text-sm">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-gray-700 font-medium">{step.step}</p>
                                    <div className="flex mt-2 text-sm items-center flex-wrap gap-2">
                                      <Badge variant={step.assignedTo === "ai" ? "default" : "secondary"} className="mr-2">
                                        {step.assignedTo === "ai" ? "AI-Powered" : "Human Expert"}
                                      </Badge>
                                      <span className="text-gray-500 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                          <circle cx="12" cy="12" r="10"/>
                                          <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        Est. {step.estimatedHours} {step.estimatedHours === 1 ? 'hour' : 'hours'}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-primary-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <line x1="12" y1="1" x2="12" y2="23"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            Estimated Cost
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 flex items-center">
                            <div className="text-2xl font-bold text-primary-800">
                              ${aiAnalysis.costEstimateRange.min} - ${aiAnalysis.costEstimateRange.max}
                            </div>
                            <div className="ml-4 text-sm text-gray-500">
                              Final cost depends on complexity and time required
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={createRequestMutation.isPending || !title.trim() || !description.trim() || isSubmitting}
              >
                {createRequestMutation.isPending || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : isLoadingRequest ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : !request ? (
          <Card>
            <CardContent className="py-10 text-center">
              <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
              <p className="text-gray-500 mb-6">
                The request you're looking for does not exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{request.title}</CardTitle>
                    <CardDescription>
                      Created {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Badge className={statusColor[request.status] || ""}>
                    {request.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">{request.description}</p>
                  </div>

                  {request.aiPlan && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">AI-Generated Plan</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <p className="text-gray-700 mb-4">{request.aiPlan.summary}</p>

                        <h4 className="font-medium mb-2">Steps</h4>
                        <ul className="space-y-2">
                          {request.aiPlan.plan.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-gray-200 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
                                {index + 1}
                              </span>
                              <div>
                                <p className="text-gray-700">{step.step}</p>
                                <div className="flex items-center mt-1 space-x-2 text-sm">
                                  <Badge variant={step.assignedTo === "ai" ? "outline" : "default"}>
                                    {step.assignedTo === "ai" ? "AI Task" : "Human Task"}
                                  </Badge>
                                  <span className="text-gray-500">
                                    ~{step.estimatedHours} {step.estimatedHours === 1 ? "hour" : "hours"}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Estimated Cost</h4>
                          <div className="flex space-x-2">
                            <p className="text-gray-700">
                              ${request.aiPlan.costEstimateRange.min / 100} - ${request.aiPlan.costEstimateRange.max / 100}
                            </p>

                            {request.status === "pending" && (
                              <Button 
                                onClick={handleSubmitPayment}
                                disabled={submitPaymentMutation.isPending}
                                size="sm"
                              >
                                {submitPaymentMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Proceed with Payment"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="messages">
              <TabsList>
                <TabsTrigger value="messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="steps">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Steps
                </TabsTrigger>
                <TabsTrigger value="review">
                  <Users className="h-4 w-4 mr-2" />
                  Human Review
                </TabsTrigger>
                <TabsTrigger value="contracts">
                  <FileText className="h-4 w-4 mr-2" />
                  Contracts
                </TabsTrigger>
                <TabsTrigger value="meetings">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Meetings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="mt-6">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <ChatUI
                    requestId={parseInt(params.id)}
                    userId={auth.user?.id || ""}
                    initialMessages={messages || []}
                    onNewMessage={(message) => {
                      queryClient.invalidateQueries({ queryKey: [`/api/requests/${params.id}/messages`] });
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="steps" className="mt-6">
                {isLoadingSteps ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : !steps || steps.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <h2 className="text-lg font-semibold mb-2">No Steps Created Yet</h2>
                      <p className="text-gray-500">
                        Once your request is approved, steps will be created to track progress.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <ul className="space-y-4">
                          {steps.map((step) => (
                            <li key={step.id} className="pb-4 border-b border-gray-100 last:border-0">
                              <div className="flex items-start">
                                <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 ${
                                  step.status === "completed" 
                                    ? "bg-green-500 text-white" 
                                    : step.status === "in_progress" 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-200 text-gray-700"
                                }`}>
                                  {step.status === "completed" ? "✓" : step.order}
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-800 font-medium">{step.description}</p>
                                  <div className="flex items-center mt-1 space-x-2 text-sm">
                                    <Badge variant={step.assignedTo === "ai" ? "outline" : "default"}>
                                      {step.assignedTo === "ai" ? "AI Task" : "Human Expert"}
                                    </Badge>
                                    <span className="text-gray-500">
                                      {step.status === "completed" 
                                        ? `Completed ${formatDistanceToNow(new Date(step.completedAt), { addSuffix: true })}` 
                                        : step.status === "in_progress" 
                                        ? "In progress" 
                                        : "Pending"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="contracts" className="mt-6">
                {/* Using our new ContractGenerator component */}
                {request && (
                  <div className="max-w-4xl mx-auto">
                    <ContractGenerator
                      requestId={parseInt(params.id)}
                      requestTitle={request.title}
                      requestDescription={request.description}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="meetings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule a Meeting</CardTitle>
                    <CardDescription>
                      Book a meeting with our team to discuss your request
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-500">
                        No meetings scheduled yet. Use the form below to schedule a meeting with our team.
                      </p>
                      <form className="space-y-4">
                        <FormField
                          name="topic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meeting Topic</FormLabel>
                              <FormControl>
                                <Input placeholder="Discuss request details" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input type="date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <Input type="time" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button className="w-full">
                          Schedule Meeting
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}