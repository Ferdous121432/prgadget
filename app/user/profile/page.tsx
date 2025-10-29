import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import ProfileForm from "./profile-form";
import { requireAuth } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Customer Profile",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Profile = async () => {
  return (
    <SessionProvider>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="h2-bold">Profile</h2>
        <ProfileForm />
      </div>
    </SessionProvider>
  );
};

export default Profile;
