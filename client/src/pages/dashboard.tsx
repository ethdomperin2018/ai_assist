import React, { useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuthContext, AuthContextType } from "../App";
import Sidebar from "@/components/dashboard/Sidebar";
import RequestCard from "@/components/dashboard/RequestCard";
import CreateRequestButton from "@/components/dashboard/CreateRequestButton";
import { useTitle } from "../hooks/useTitle";

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const auth = useContext(AuthContext) as AuthContextType;
  
  useTitle("Dashboard | Assist.ai");

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate("/login?redirect=dashboard");
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["/api/requests"],
    enabled: auth.isAuthenticated,
  });

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null; // Will redirect in the useEffect hook
  }

  const pendingRequests = requests?.filter((req) => req.status === "pending") || [];
  const inProgressRequests = requests?.filter((req) => req.status === "in_progress") || [];
  const completedRequests = requests?.filter((req) => req.status === "completed") || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <CreateRequestButton />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load requests. Please try again later.
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm animate-pulse h-48"
              ></div>
            ))}
          </div>
        ) : requests?.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No requests yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first request
            </p>
            <CreateRequestButton />
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Requests ({requests?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress ({inProgressRequests.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests?.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="in-progress">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
