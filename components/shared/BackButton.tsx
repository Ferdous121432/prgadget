"use client";

import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button className="button-primary" onClick={() => router.back()}>
      Go Back
    </Button>
  );
}
