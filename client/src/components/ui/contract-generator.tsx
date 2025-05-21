import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Download, AlertCircle, CheckCircle } from "lucide-react";
import { draftContract } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

interface ContractGeneratorProps {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
}

export function ContractGenerator({ requestId, requestTitle, requestDescription }: ContractGeneratorProps) {
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [contractContent, setContractContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateContract = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Combine request description with any additional details
      const fullDetails = `
Request Title: ${requestTitle}
Request Description: ${requestDescription}
${additionalDetails ? `Additional Details: ${additionalDetails}` : ""}
      `.trim();
      
      const result = await draftContract(requestId, fullDetails);
      setContractContent(result.contractContent);
      
      toast({
        title: "Contract Generated",
        description: "Your contract has been successfully generated.",
        duration: 5000,
      });
    } catch (err) {
      console.error("Error generating contract:", err);
      setError("Failed to generate contract. Please try again.");
      
      toast({
        title: "Error",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadContract = () => {
    if (!contractContent) return;
    
    const blob = new Blob([contractContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Contract-${requestId}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Contract Downloaded",
      description: "Your contract has been downloaded.",
    });
  };

  return (
    <Card className="border-primary-100 shadow-md">
      <CardHeader className="bg-primary-50 text-primary-900 border-b border-primary-100">
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Contract Generator
        </CardTitle>
        <CardDescription>
          Generate a legal contract based on the details of this request
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {!contractContent ? (
          <>
            <div className="text-sm space-y-4">
              <p>
                Our AI can draft a contract for this request based on the request details and any additional information you provide.
              </p>
              <p>
                The contract will include scope of work, deliverables, timeline, payment terms, and standard legal protections.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="additionalDetails" className="text-sm font-medium">
                Additional Contract Details (Optional)
              </label>
              <Textarea
                id="additionalDetails"
                placeholder="Add any specific terms, conditions, or details you want included in the contract..."
                rows={5}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                disabled={isGenerating}
                className="resize-none"
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Contract Generated</AlertTitle>
              <AlertDescription>
                Your contract has been generated successfully. You can download it or view it below.
              </AlertDescription>
            </Alert>
            
            <div className="border rounded-md p-4 bg-gray-50 mt-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {contractContent}
              </pre>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-end space-x-2 p-4">
        {!contractContent ? (
          <Button 
            onClick={handleGenerateContract} 
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Contract
              </>
            )}
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => setContractContent(null)}
            >
              Edit Details
            </Button>
            
            <Button 
              onClick={handleDownloadContract}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Contract
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}