import { Brand } from "../types";

export const BRANDS: Brand[] = [
  {
    id: "jpm-studios",
    name: "JPM Studios",
    tileImage: "/disney/brands/jpm-studios.png",
    hoverVideo: "/disney/brands/jpm-studios.mp4",
    tileColor: "#003087",
    accentColor: "#0050C8",
    description: "Stories from inside JPMorgan Chase — platform innovation and agentic AI.",
  },
  {
    id: "wealth-pictures",
    name: "Intern Pictures",
    tileImage: "/disney/brands/wealth-pictures.png",
    hoverVideo: "/disney/brands/wealth-pictures.mp4",
    tileColor: "#8B0000",
    accentColor: "#C0392B",
    description: "Internship dramas — energy research and treasury audits.",
  },
  {
    id: "smith-capital",
    name: "Terrapin Theatre",
    tileImage: "/disney/brands/smith-capital.png",
    hoverVideo: "/disney/brands/smith-capital.mp4",
    tileColor: "#7D6608",
    accentColor: "#D4A017",
    description: "University of Maryland equity research and student investing.",
  },
  {
    id: "personal-ventures",
    name: "Personal Ventures",
    tileImage: "/disney/brands/personal-ventures.png",
    hoverVideo: "/disney/brands/personal-ventures.mp4",
    tileColor: "#7D3C00",
    accentColor: "#E67E22",
    description: "Entrepreneur originals — sneaker reselling and Amazon storefronts.",
  },
  {
    id: "ai-labs",
    name: "AI Labs",
    tileImage: "/disney/brands/ai-labs.png",
    hoverVideo: "/disney/brands/ai-labs.mp4",
    tileColor: "#2C0654",
    accentColor: "#7C3AED",
    description: "Agentic platforms and multi-agent simulations.",
  },
];

export function getBrandById(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id);
}
