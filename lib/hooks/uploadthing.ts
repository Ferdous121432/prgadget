"use server";

import { utapi } from "@/app/api/uploadthing/uploadthing";

// Function to delete images from UploadThing by their keys
export async function deleteImagesFromUploadThing(keys: string[]) {
  await utapi.deleteFiles(keys);
  //   await fetch("/api/delete-uploadthing", {
  //     method: "POST",
  //     body: JSON.stringify({ keys }),
  //     headers: { "Content-Type": "application/json" },
  //   });
}
