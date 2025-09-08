import React from "react";
import CreateHomePageSlider from "./CreateHomePageSlider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users",
};

function page() {
  return (
    <div>
      <CreateHomePageSlider />
    </div>
  );
}

export default page;
