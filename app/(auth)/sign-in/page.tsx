import { auth } from "@/auth";
import AppLogo from "@/components/shared/header/AppLogo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import CredentialsSignInForm from "./credentials-signin-form";

export const metadata: Metadata = {
  title: "Sign In",
};

// Force dynamic rendering since we use auth/session data
export const dynamic = "force-dynamic";

const SignInPage = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();
  // console.log("Session in SignInPage:", session);

  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <AppLogo />
          {/* <CardTitle className="text-center">Sign In</CardTitle> */}
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
