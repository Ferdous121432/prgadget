import Footer from "@/components/Footer";
import Header from "@/components/shared/header/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PRgadget",
  description:
    ".A modern ecommerce website, build with nextjs, Postgresql . you will get all kind of authentic premimum gadgets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col ">
      <Header />
      <main className="flex-1 wrapper ">{children}</main>
      <Footer />
    </div>
  );
}
