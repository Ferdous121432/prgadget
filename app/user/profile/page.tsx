import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import ProfileForm from "./profile-form";
import { requireAuth } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Customer Profile",
};

const Profile = async () => {
  const session = await requireAuth("/user/profile");

  return (
    <SessionProvider session={session}>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="h2-bold">Profile</h2>
        <ProfileForm />
      </div>
    </SessionProvider>
  );
};

export default Profile;
