"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.reload();
  };

  return (
    <Button
      onClick={handleSignOut}
      className="w-full items-center button-primary hover:text-slate-50 py-4 px-2 h-4 justify-center"
      variant="ghost">
      Sign Out
    </Button>
  );
}
