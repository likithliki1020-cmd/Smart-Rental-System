import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { api } from "../../../../convex/_generated/api";

const f = createUploadthing();

async function requireSignedInUser() {
  const token = await convexAuthNextjsToken();
  if (!token) throw new UploadThingError("Not signed in.");

  const user = await fetchQuery(api.users.getCurrentUserProfile, {}, { token });
  if (!user) throw new UploadThingError("Not signed in.");
  return user;
}

export const ourFileRouter = {
  // Property photos + documents, owner/manager/admin only.
  propertyMedia: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await requireSignedInUser();
      if (!["owner", "manager", "admin"].includes(user.role)) {
        throw new UploadThingError("Forbidden.");
      }
      return { userId: user._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),

  // Maintenance request photos, tenant only.
  maintenancePhotos: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await requireSignedInUser();
      if (user.role !== "tenant") throw new UploadThingError("Forbidden.");
      return { userId: user._id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
