"use client";
import { APP_LOGO, APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col min-w-[300px] max-w-[600px] items-center justify-center min-h-screen mx-auto">
      <Image
        src={APP_LOGO}
        width={128}
        height={128}
        alt={`${APP_NAME} logo`}
        priority={true}
      />
      <div className="p-6 w-full rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Not Found</h1>
        <p className="text-shadow-destructive text-red-800">
          Could not find requested page
        </p>
        <Button variant="outline" className="mt-4 ml-2" asChild>
          <Link href="/">Back To Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
