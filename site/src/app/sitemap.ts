import type { MetadataRoute } from "next";
import { getAgents, getRules, getSkills } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const skills = getSkills();
  const agents = getAgents();
  const rules = getRules();

  return [
    {
      url: "https://usearc.dev",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...skills.map((skill) => ({
      url: `https://usearc.dev/skills/${skill.name}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...agents.map((agent) => ({
      url: `https://usearc.dev/agents/${agent.name}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...rules.map((rule) => ({
      url: `https://usearc.dev/rules/${rule.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
