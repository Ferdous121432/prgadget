"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

const CustomToastExamples = () => {
  
  // Example 1: Simple div with custom content
  const showSimpleCustomToast = () => {
    toast(
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <div>
          <p className="font-medium">Success!</p>
          <p className="text-sm text-muted-foreground">Your action was completed successfully.</p>
        </div>
      </div>
    );
  };

  // Example 2: Complex div with multiple elements
  const showComplexCustomToast = () => {
    toast(
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            New Update Available
          </h4>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">v2.1.0</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Version 2.1.0 includes new features and bug fixes.
        </p>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>
            Later
          </Button>
          <Button size="sm" onClick={() => {
            toast.success("Update started!");
            toast.dismiss();
          }}>
            Update Now
          </Button>
        </div>
      </div>
    );
  };

  // Example 3: Error toast with custom div
  const showErrorToast = () => {
    toast(
      <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-red-900">Upload Failed</p>
          <p className="text-sm text-red-700">
            The file could not be uploaded. Please check the file size and format.
          </p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={() => {
              toast.success("Retrying upload...");
            }}>
              Retry
            </Button>
          </div>
        </div>
      </div>,
      {
        duration: 8000, // Keep longer for complex content
      }
    );
  };

  // Example 4: Loading toast with progress
  const showLoadingToast = () => {
    toast(
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <div>
          <p className="font-medium">Processing...</p>
          <p className="text-sm text-muted-foreground">Please wait while we process your request.</p>
        </div>
      </div>,
      {
        duration: Infinity, // Keep until manually dismissed
        id: "loading-toast", // Assign ID to dismiss later
      }
    );

    // Simulate completion after 3 seconds
    setTimeout(() => {
      toast.dismiss("loading-toast");
      toast.success("Processing completed!");
    }, 3000);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">Custom Toast Examples</h2>
      <div className="space-y-2">
        <Button onClick={showSimpleCustomToast} variant="outline">
          Simple Custom Toast
        </Button>
        <Button onClick={showComplexCustomToast} variant="outline">
          Complex Custom Toast
        </Button>
        <Button onClick={showErrorToast} variant="outline">
          Error Toast with Actions
        </Button>
        <Button onClick={showLoadingToast} variant="outline">
          Loading Toast
        </Button>
      </div>
    </div>
  );
};

export default CustomToastExamples;
