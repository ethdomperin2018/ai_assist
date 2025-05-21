import React, { useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AuthContext, AuthContextType } from "../App";
import Sidebar from "@/components/dashboard/Sidebar";
import { useTitle } from "../hooks/useTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/analytics-charts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users, FileText, Clock, DollarSign, Briefcase, TrendingUp, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Analytics() {
  const [location, navigate] = useLocation();
  const auth = useContext(AuthContext) as AuthContextType;
  
  useTitle("Analytics Dashboard | Assist.ai");

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate("/login?redirect=analytics");
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: auth.isAuthenticated,
  });

  // Fetch all requests - we'll use this for displaying charts
  const { data: requests } = useQuery({
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

  // Calculate data for charts
  const requestsByStatus = {
    labels: ["Pending", "In Progress", "Completed", "Cancelled"],
    datasets: [
      {
        data: [
          requests?.filter(r => r.status === "pending").length || 0,
          requests?.filter(r => r.status === "in_progress").length || 0,
          requests?.filter(r => r.status === "completed").length || 0,
          requests?.filter(r => r.status === "cancelled").length || 0
        ],
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"]
      }
    ]
  };

  // Compute monthly request counts for the last 6 months
  const getMonthlyRequestData = () => {
    const now = new Date();
    const months = [];
    const counts = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push(monthName);
      
      // Count requests created in this month
      const count = requests?.filter(req => {
        const reqDate = new Date(req.createdAt);
        return reqDate.getMonth() === month.getMonth() && 
               reqDate.getFullYear() === month.getFullYear();
      }).length || 0;
      
      counts.push(count);
    }

    return {
      labels: months,
      datasets: [
        {
          data: counts,
          fill: false,
          borderColor: "#3b82f6",
          tension: 0.1
        }
      ]
    };
  };

  const estimatedCostData = {
    labels: ["$0-$100", "$100-$500", "$500-$1000", "$1000+"],
    datasets: [
      {
        data: [
          requests?.filter(r => r.costEstimate < 10000).length || 0,
          requests?.filter(r => r.costEstimate >= 10000 && r.costEstimate < 50000).length || 0,
          requests?.filter(r => r.costEstimate >= 50000 && r.costEstimate < 100000).length || 0,
          requests?.filter(r => r.costEstimate >= 100000).length || 0
        ],
        backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f87171"]
      }
    ]
  };

  // Calculate metrics
  const completionRate = requests?.length > 0 
    ? Math.round((requests.filter(r => r.status === "completed").length / requests.length) * 100) 
    : 0;

  const avgResponseTime = analyticsData?.avgResponseTime || "6.2 hours";
  const totalRevenue = analyticsData?.totalRevenue || "$14,385";
  const customerSatisfaction = analyticsData?.satisfaction || "4.8/5";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Business insights and performance metrics</p>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load analytics data. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Requests</p>
                      <h3 className="text-2xl font-bold">{requests?.length || 0}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                      <h3 className="text-2xl font-bold">{completionRate}%</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                      <h3 className="text-2xl font-bold">{avgResponseTime}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <h3 className="text-2xl font-bold">{totalRevenue}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Requests by Status</CardTitle>
                      <CardDescription>Distribution of requests across different statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PieChart data={requestsByStatus} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Requests Over Time</CardTitle>
                      <CardDescription>Monthly request volume for the past 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart data={getMonthlyRequestData()} />
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Cost Estimates Distribution</CardTitle>
                      <CardDescription>Breakdown of requests by estimated cost range</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChart data={estimatedCostData} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="requests">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Request Categories</CardTitle>
                      <CardDescription>Most popular assistance categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Virtual Assistance</span>
                          <span className="font-bold">38%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "38%" }}></div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Research</span>
                          <span className="font-bold">27%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "27%" }}></div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Technical Support</span>
                          <span className="font-bold">18%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "18%" }}></div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Content Creation</span>
                          <span className="font-bold">12%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "12%" }}></div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Other</span>
                          <span className="font-bold">5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "5%" }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>AI vs Human Tasks</CardTitle>
                      <CardDescription>Distribution of tasks between AI and human assistants</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <div className="w-48 h-48 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="block text-lg font-medium">Task Distribution</span>
                          </div>
                        </div>
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          <circle r="40" cx="50" cy="50" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                          <circle 
                            r="40" 
                            cx="50" 
                            cy="50" 
                            fill="transparent" 
                            stroke="#3b82f6" 
                            strokeWidth="12" 
                            strokeDasharray={`${62 * 2.51} ${40 * 6.28 - 62 * 2.51}`}
                          />
                        </svg>
                        <div className="absolute top-full mt-4 left-0 w-full flex justify-between">
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span>AI: 62%</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                              <span>Human: 38%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Satisfaction</CardTitle>
                      <CardDescription>Overall client satisfaction rating</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="text-5xl font-bold text-blue-600 mb-4">{customerSatisfaction}</div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-4">Based on {requests?.length || 0} completed requests</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="revenue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Month</CardTitle>
                      <CardDescription>Monthly revenue for the past 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BarChart 
                        data={{
                          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                          datasets: [{
                            data: [1850, 2410, 1980, 2690, 2750, 3130],
                            backgroundColor: "#60a5fa"
                          }]
                        }} 
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Request Type</CardTitle>
                      <CardDescription>Distribution of revenue across request types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PieChart 
                        data={{
                          labels: ["Virtual Assistance", "Research", "Technical Support", "Content Creation", "Other"],
                          datasets: [{
                            data: [5380, 3920, 2730, 1820, 785],
                            backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280"]
                          }]
                        }} 
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Top Clients by Revenue</CardTitle>
                      <CardDescription>Clients generating the most revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                              AC
                            </div>
                            <div>
                              <p className="font-medium">Acme Corporation</p>
                              <p className="text-sm text-gray-500">12 requests</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">$3,245</p>
                            <p className="text-sm text-gray-500">22.5%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-3">
                              GL
                            </div>
                            <div>
                              <p className="font-medium">Global Tech</p>
                              <p className="text-sm text-gray-500">8 requests</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">$2,880</p>
                            <p className="text-sm text-gray-500">20.0%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                              SS
                            </div>
                            <div>
                              <p className="font-medium">Startup Solutions</p>
                              <p className="text-sm text-gray-500">15 requests</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">$2,430</p>
                            <p className="text-sm text-gray-500">16.9%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold mr-3">
                              ME
                            </div>
                            <div>
                              <p className="font-medium">Media Enterprises</p>
                              <p className="text-sm text-gray-500">9 requests</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">$1,960</p>
                            <p className="text-sm text-gray-500">13.6%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold mr-3">
                              OT
                            </div>
                            <div>
                              <p className="font-medium">Others</p>
                              <p className="text-sm text-gray-500">23 requests</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">$3,870</p>
                            <p className="text-sm text-gray-500">27.0%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="performance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Time Trends</CardTitle>
                      <CardDescription>Average response time over the past 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart 
                        data={{
                          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                          datasets: [{
                            data: [8.4, 7.8, 7.2, 6.5, 6.2, 5.9],
                            fill: false,
                            borderColor: "#10b981",
                            tension: 0.1
                          }]
                        }} 
                      />
                      <div className="text-center mt-4 text-sm text-gray-500">
                        Response time in hours
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Performance</CardTitle>
                      <CardDescription>Team member efficiency metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Sarah Johnson</span>
                            <span className="font-semibold">93%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "93%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Michael Chen</span>
                            <span className="font-semibold">87%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "87%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Jessica Patel</span>
                            <span className="font-semibold">91%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "91%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>David Kim</span>
                            <span className="font-semibold">84%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "84%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Emma Garcia</span>
                            <span className="font-semibold">89%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: "89%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Efficiency</CardTitle>
                      <CardDescription>AI involvement and handoff metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Auto-Resolved</p>
                          <p className="text-2xl font-bold text-blue-700">42%</p>
                          <p className="text-xs text-gray-500 mt-1">+3.5% from last month</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Avg AI Analysis</p>
                          <p className="text-2xl font-bold text-green-700">2.3 min</p>
                          <p className="text-xs text-gray-500 mt-1">-0.5 min from last month</p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Human Handoff</p>
                          <p className="text-2xl font-bold text-purple-700">38%</p>
                          <p className="text-xs text-gray-500 mt-1">-2.1% from last month</p>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Model Accuracy</p>
                          <p className="text-2xl font-bold text-yellow-700">94.3%</p>
                          <p className="text-xs text-gray-500 mt-1">+1.2% from last month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Contract Review Stats</CardTitle>
                      <CardDescription>Contract process efficiency metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Average Review Time</p>
                            <p className="text-2xl font-bold">4.2 hours</p>
                          </div>
                          <Briefcase className="h-8 w-8 text-blue-500" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Approval Rate</p>
                            <p className="text-2xl font-bold">87.5%</p>
                          </div>
                          <FileText className="h-8 w-8 text-green-500" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Revision Requests</p>
                            <p className="text-2xl font-bold">13.2%</p>
                          </div>
                          <Calendar className="h-8 w-8 text-yellow-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}