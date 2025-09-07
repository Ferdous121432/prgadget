import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import AppLogo from "@/components/shared/header/AppLogo";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();
  console.log("Session in SignInPage:", session);

  if (session) {
    return redirect(callbackUrl || "/");
  }
  return (
    <div className="bg-muted w-screen flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <AppLogo />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
