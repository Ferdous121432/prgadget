import { auth } from "@/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug

  imageUploader: f({
    image: {
      maxFileSize: "4MB",
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      console.log("Creating image uploader...💥💥💥");
      const session = await auth();
      const user = session?.user;

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      console.log("Upload complete for userId:", metadata.userId);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  //for UploadDropzone
  imageDropzone: f({
    image: {
      maxFileSize: "1MB",
      maxFileCount: 5, // Limit the number of files to 5
      minFileCount: 1, // Ensure at least one file is uploaded
    },
  })
    .middleware(async () => {
      console.log("Creating image dropzone...💥💥💥");
      const session = await auth();
      const user = session?.user;

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata }) => {
      console.log("Dropzone upload complete for userId:", metadata.userId);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
