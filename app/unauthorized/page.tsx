import BackButton from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unauthorized Access",
};

export default function UnauthorizedPage() {
  const handleGoBack = () => {
    window.history.back();
  };
  return (
    <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center space-y-4">
      <h1 className="h1-bold text-4xl">Unauthorized Access</h1>
      <p className="text-muted-foreground">
        You do not have permission to access this page.
      </p>
      <div className="flex space-x-4">
        <Button className="button-primary" asChild>
          <Link href="/">Return Home</Link>
        </Button>
        <BackButton />
      </div>
    </div>
  );
}
