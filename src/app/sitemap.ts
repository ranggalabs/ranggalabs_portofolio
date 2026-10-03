import { MetadataRoute } from "next";
import { initialProjects } from "@/data/initialData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ranggaprasetya.dev";

  const staticRoutes = ["", "/projects", "/about", "/cv", "/contact"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.8,
    })
  );

  const projectRoutes = initialProjects
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...projectRoutes];
}
