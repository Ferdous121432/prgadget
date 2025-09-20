"use client";

import { Button } from "@/components/ui/button";
import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/"); // Redirect to home page after sign out
  };

  return (
    <Button
      onClick={handleSignOut}
      className="w-full relative items-center button-primary hover:text-slate-50 py-4 px-2 h-4 justify-center"
      variant="ghost">
      <IconLogout className="absolute left-3 text-white font-semibold dark:text-slate-600 " />
      <span>Log out</span>
    </Button>
  );
}
