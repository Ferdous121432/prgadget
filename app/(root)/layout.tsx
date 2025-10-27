import Navigation from "@/components/header/navigation";
import Footer from "@/components/shared/footer/Footer";
import Header from "@/components/shared/header/Header";
import { Navbar } from "@/components/shared/header/Navbar";
import { getNavCategories } from "@/lib/actions/category.actions";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "PRgadget",
  description:
    ".A modern ecommerce website, build with nextjs, Postgresql . you will get all kind of authentic premimum gadgets",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navCategories = (await getNavCategories()) as any[];
  // console.log("navCategories", navCategories);
  return (
    <SessionProvider>
      <div className="flex h-screen flex-col ">
        <Header />
        {/* <Navbar categories={navCategories} /> */}
        <Navigation />

        <main className="flex-1 wrapper ">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
