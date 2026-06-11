import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SURS - Smart University Registration System",
    short_name: "SURS",
    description: "UPTM student registration, enrollment, and fee payment",
    start_url: "/",
    display: "standalone",
    background_color: "#002244",
    theme_color: "#002244",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/surs-logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
