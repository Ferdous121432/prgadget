import AdminSliderPage from "@/components/admin/HomepageSlider";
import HomePageSlider from "@/components/admin/HomepageSlider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import Link from "next/link";
import React, { memo } from "react";

export const metadata: Metadata = {
  title: "Admin Users",
};

const AdminHomePage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) => {
  await requireAdmin();

  const { page = "1", query: searchText } = await props.searchParams;

  //TODO: Implement homepage admin features
  // Image slider management
  // Featured products management
  // Latest products management
  // Promotional banners management
  // SEO settings management

  return (
    <>
      <Tabs defaultValue="slider" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="slider">Slider</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>
        <TabsContent value="slider">
          <AdminSliderPage />
        </TabsContent>
        <TabsContent value="featured">
          Manage the featured products settings here.
        </TabsContent>
        <TabsContent value="latest">
          Manage the latest products settings here.
        </TabsContent>
        <TabsContent value="banners">
          Manage the promotional banners settings here.
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AdminHomePage;
