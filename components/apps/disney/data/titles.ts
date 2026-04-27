import { Title, TitleCategory } from "../types";

export const TITLES: Title[] = [
  // ── MOVIES (work experiences) ─────────────────────────────────────────────
  {
    id: "navigator",
    type: "movie",
    title: "Wolf of JP",
    subTitle: "2025–2026 · 1h 52m · Thriller, Drama",
    tagline: "Thirty percent fewer escalations. One analyst's mission.",
    description:
      "A sharp product analyst joins JPMorgan's Navigator platform team and discovers a system on the brink. With client service reps drowning in unresolved cases, he engineers a solution that cuts resolution time by nearly a third and lets reps get ahead of crises before they ignite. Part corporate thriller, part origin story.",
    year: 2025,
    rating: "PG",
    runtime: "1h 52m",
    genres: ["Thriller", "Drama", "Corporate"],
    brand: "jpm-studios",
    category: "recommend",
    cardImage: "/wolf-of-jp.png",
    backgroundImage: "/wolf-of-jp.png",
    titleImage: "/disney/title-logos/navigator.png",
    sliderImage: "/wolf-of-jp.png",
    cast: ["James B. McFadden"],
    director: "JPMorgan Chase",
    fallbackGradient: "from-blue-950 via-blue-900 to-slate-900",
    featured: true,
  },
  {
    id: "agentic-protocol",
    type: "movie",
    title: "The Agentic Protocol",
    subTitle: "2025–2026 · 2h 4m · Sci-Fi, Drama",
    tagline: "What if the bankers never had to show up?",
    description:
      "When access to real investment bankers is scarce and iteration cycles are killing deadlines, one team builds something unprecedented: self-learning AI agents that think, argue, and score like a full IB desk. Inspired by cutting-edge autonomous AI research, this sci-fi drama imagines the near future of finance.",
    year: 2025,
    rating: "PG-13",
    runtime: "2h 4m",
    genres: ["Sci-Fi", "Drama", "Finance"],
    brand: "jpm-studios",
    category: "original",
    cardImage: "/agentic-protocol.png",
    backgroundImage: "/agentic-protocol.png",
    titleImage: "/disney/title-logos/agentic-protocol.png",
    sliderImage: "/agentic-protocol.png",
    cast: ["James B. McFadden"],
    director: "JPMorgan Chase",
    fallbackGradient: "from-blue-950 via-blue-900 to-slate-900",
  },
  {
    id: "the-transition",
    type: "movie",
    title: "Critical Mass",
    subTitle: "2024 · 1h 38m · Documentary, Finance",
    tagline: "HALEU is the bottleneck. Whoever solves it controls the grid.",
    description:
      "A young wealth management analyst digs deep into the global energy transition, uncovering a race against time: HALEU production is bottlenecked, Big Tech is cutting unprecedented deals with nuclear plants, and government bills are either salvation or delay. A documentary-style drama set inside a Boston trading floor.",
    year: 2024,
    rating: "PG",
    runtime: "1h 38m",
    genres: ["Documentary", "Finance", "Energy"],
    brand: "wealth-pictures",
    category: "trending",
    cardImage: "/critical-mass.png",
    backgroundImage: "/critical-mass.png",
    titleImage: "/disney/title-logos/the-transition.png",
    cast: ["James B. McFadden"],
    director: "Bank of America Merrill Lynch",
    fallbackGradient: "from-amber-900 via-orange-900 to-red-950",
  },
  {
    id: "the-audit",
    type: "movie",
    title: "The $100K Audit",
    subTitle: "2023 · 1h 44m · Thriller, Mystery",
    tagline: "The money was always there. No one was looking.",
    description:
      "A treasury management summer analyst uncovers $100,000 in lost monthly revenue buried in product records that nobody had checked in years. Armed with XAA and Horizon XE, he runs a full audit in a race against the fiscal quarter — and discovers how much a careful eye is worth. A Richmond heist with no vault and no getaway car.",
    year: 2023,
    rating: "PG",
    runtime: "1h 44m",
    genres: ["Thriller", "Finance", "Mystery"],
    brand: "wealth-pictures",
    category: "new",
    cardImage: "/disney/cards/the-audit.jpg",
    backgroundImage: "/disney/backgrounds/the-audit.jpg",
    titleImage: "/disney/title-logos/the-audit.png",
    cast: ["James B. McFadden"],
    director: "Atlantic Union Bank",
    fallbackGradient: "from-red-950 via-rose-900 to-zinc-900",
  },

  // ── SERIES (projects and startups) ───────────────────────────────────────
  {
    id: "kicks-by-jj",
    type: "series",
    title: "Kicks_ByJJ",
    subTitle: "2019 · 3 Seasons · Business, Reality",
    tagline: "Every pair tells a story. So does every deal.",
    description:
      "From a bedroom in Glen Allen, Virginia, a teenager starts flipping limited-edition sneakers. Four years later, he has a global client network, $5,000 in goods exchanged internationally, and over $105,000 in revenue. Follow the hustle — season by season — through the highs of rare drops and the lows of a market that never sleeps.",
    year: 2019,
    rating: "TV-PG",
    seasons: 3,
    genres: ["Business", "Reality", "Hustle"],
    brand: "personal-ventures",
    category: "trending",
    cardImage: "/kicks-byjj.png",
    backgroundImage: "/kicks-byjj.png",
    titleImage: "/disney/title-logos/kicks-by-jj.png",
    sliderImage: "/disney/slider/kicks-by-jj.jpg",
    cast: ["James B. McFadden"],
    director: "Personal Ventures",
    fallbackGradient: "from-orange-900 via-amber-800 to-zinc-900",
    episodes: [
      { id: "k-s1e1", number: 1, title: "The First Flip", description: "One pair. One listing. One lesson learned the hard way.", duration: "38m" },
      { id: "k-s1e2", number: 2, title: "Reading the Market", description: "How to spot a drop before the bots do.", duration: "41m" },
      { id: "k-s1e3", number: 3, title: "Scale", description: "When volume gets real and margins get tight.", duration: "45m" },
      { id: "k-s1e4", number: 4, title: "Going Global", description: "First international deal. First wire transfer.", duration: "52m" },
      { id: "k-s1e5", number: 5, title: "The Network", description: "The client list grows — but so does the competition.", duration: "47m" },
      { id: "k-s1e6", number: 6, title: "$105K", description: "Final tally. Final lesson.", duration: "55m" },
    ],
  },
  {
    id: "oakmont-empire",
    type: "series",
    title: "Oakmont Empire",
    subTitle: "2023 · 1 Season · Documentary, Business",
    tagline: "Beauty, collectibles, and a whole lot of Amazon Prime.",
    description:
      "Two co-founders launch an Amazon storefront from scratch — sourcing beauty products and collectible items, reading the algorithm, and racing to 1,300 units sold. Oakmont Empire is a business documentary series about what it takes to build a brand on someone else's platform.",
    year: 2023,
    rating: "TV-G",
    seasons: 1,
    genres: ["Documentary", "Business", "E-Commerce"],
    brand: "personal-ventures",
    category: "new",
    cardImage: "/disney/cards/oakmont-empire.jpg",
    backgroundImage: "/disney/backgrounds/oakmont-empire.jpg",
    titleImage: "/disney/title-logos/oakmont-empire.png",
    cast: ["James B. McFadden"],
    director: "Personal Ventures",
    fallbackGradient: "from-emerald-900 via-teal-900 to-slate-900",
    episodes: [
      { id: "o-s1e1", number: 1, title: "Open for Business", description: "Setting up shop on Amazon's most competitive battleground.", duration: "36m" },
      { id: "o-s1e2", number: 2, title: "The Category Play", description: "Why beauty + collectibles? The data told us so.", duration: "40m" },
      { id: "o-s1e3", number: 3, title: "First 100 Units", description: "Logistics, reviews, and the patience of early adopters.", duration: "38m" },
      { id: "o-s1e4", number: 4, title: "Algorithm Season", description: "Cracking the Buy Box is harder than it looks.", duration: "43m" },
      { id: "o-s1e5", number: 5, title: "1,300 and Counting", description: "How $40,000+ in revenue changes your perspective.", duration: "48m" },
      { id: "o-s1e6", number: 6, title: "What We Built", description: "Looking back at the storefront — and what comes next.", duration: "51m" },
    ],
  },
  {
    id: "tennis-vision",
    type: "series",
    title: "Tennis Vision",
    subTitle: "2026 · 1 Season · Sports, Technology",
    tagline: "The game you thought you knew — rendered in three dimensions.",
    description:
      "A computer vision engineer builds a real-time tennis analysis system from the ground up — deploying RF-DETR for player detection, Supervision for tracking, and VitPose for skeletal estimation. The result: a synthetic 3D court with live skeleton overlays and a top-down heatmap that tracks every step.",
    year: 2026,
    rating: "TV-G",
    seasons: 1,
    genres: ["Sports", "Technology", "Documentary"],
    brand: "ai-labs",
    category: "original",
    cardImage: "/tennis-vision-card.png",
    backgroundImage: "/tennis-vision-card.png",
    titleImage: "/disney/title-logos/tennis-vision.png",
    sliderImage: "/tennis-vision-card.png",
    cast: ["James B. McFadden"],
    director: "AI Labs",
    fallbackGradient: "from-green-900 via-emerald-900 to-slate-900",
    episodes: [
      { id: "tv-s1e1", number: 1, title: "Detection", description: "Building RF-DETR player detection on real match footage.", duration: "44m" },
      { id: "tv-s1e2", number: 2, title: "Tracking", description: "Supervision and the challenge of fast lateral movement.", duration: "41m" },
      { id: "tv-s1e3", number: 3, title: "Pose", description: "VitPose and the skeleton that makes every shot readable.", duration: "46m" },
      { id: "tv-s1e4", number: 4, title: "The Court", description: "Rendering a synthetic 3D court and anchoring real players inside it.", duration: "50m" },
      { id: "tv-s1e5", number: 5, title: "Heatmap", description: "Top-down coverage maps that reveal what the broadcast never shows.", duration: "38m" },
    ],
    featured: true,
  },
  {
    id: "polymind",
    type: "series",
    title: "PolyMind",
    subTitle: "2026 · 1 Season · Sci-Fi, AI",
    tagline: "Agents don't just compute. They persuade.",
    description:
      "A multi-agent LLM simulation engine where AI personas with distinct personalities debate, influence, and update each other's opinions across rounds. What starts as a consensus experiment becomes a model for crowd dynamics — and a mirror for how humans actually change their minds.",
    year: 2026,
    rating: "TV-14",
    seasons: 1,
    genres: ["Sci-Fi", "AI", "Anthology"],
    brand: "ai-labs",
    category: "original",
    cardImage: "/polymind.png",
    backgroundImage: "/polymind.png",
    titleImage: "/disney/title-logos/polymind.png",
    sliderImage: "/polymind.png",
    cast: ["James B. McFadden"],
    director: "AI Labs",
    fallbackGradient: "from-violet-950 via-indigo-900 to-black",
    episodes: [
      { id: "pm-s1e1", number: 1, title: "Cold Start", description: "Seeding five agents with distinct worldviews and one controversial prompt.", duration: "42m" },
      { id: "pm-s1e2", number: 2, title: "First Contact", description: "Round one of debate. Nobody agrees. Nobody expects to.", duration: "39m" },
      { id: "pm-s1e3", number: 3, title: "The Swing Vote", description: "One agent begins to shift. The others notice.", duration: "44m" },
      { id: "pm-s1e4", number: 4, title: "Consensus", description: "Is agreement the goal, or just the outcome?", duration: "53m" },
    ],
    featured: true,
  },
  {
    id: "terrapin-finance",
    type: "series",
    title: "Terrapin Journey",
    subTitle: "2021 · 3 Seasons · Drama, Finance, College",
    tagline: "Four years. Three chapters. One conviction.",
    description:
      "Follow a Robert H. Smith School of Business finance student across four years — building DCF models and pitching equities, managing a $70K payroll at the Office of Career Services, and leading the student investment fund through a high-stakes Starbucks equity report. Every chapter is a new test. Every season, the stakes get higher.",
    year: 2021,
    rating: "TV-G",
    seasons: 3,
    genres: ["Drama", "Finance", "College"],
    brand: "smith-capital",
    category: "trending",
    cardImage: "/terrapin-journey.png",
    backgroundImage: "/terrapin-journey.png",
    sliderImage: "/terrapin-journey.png",
    titleImage: "/disney/title-logos/terrapin-finance.png",
    cast: ["James B. McFadden"],
    director: "University of Maryland",
    fallbackGradient: "from-red-900 via-yellow-900 to-black",
    episodes: [
      { id: "tj-s1e1", number: 1, title: "Smith School", description: "First week in the Robert H. Smith School of Business.", duration: "41m" },
      { id: "tj-s1e2", number: 2, title: "The Case", description: "First case competition. First taste of real pressure.", duration: "38m" },
      { id: "tj-s1e3", number: 3, title: "Rush Season", description: "Applying to the student investment fund — and getting rejected.", duration: "35m" },
      { id: "tj-s1e4", number: 4, title: "The Model", description: "Building a DCF from scratch at 2 AM.", duration: "44m" },
      { id: "tj-s2e1", number: 5, title: "Orientation", description: "First day running the schedule at Career Services. First schedule conflict.", duration: "32m" },
      { id: "tj-s2e2", number: 6, title: "The Roster", description: "Managing fifteen people is easy — until two of them swap shifts.", duration: "35m" },
      { id: "tj-s2e3", number: 7, title: "Budget Season", description: "A $70,000 payroll and not a dollar to spare.", duration: "38m" },
      { id: "tj-s2e4", number: 8, title: "Communication Gap", description: "Information travels from management to staff — except when it doesn't.", duration: "34m" },
      { id: "tj-s2e5", number: 9, title: "Smooth Operations", description: "What does it actually take for an office to run without incident?", duration: "40m" },
      { id: "tj-s3e1", number: 10, title: "The Assignment", description: "The Smith Investment Fund announces a new coverage initiation. The ticker: Starbucks.", duration: "36m" },
      { id: "tj-s3e2", number: 11, title: "Deep Dive", description: "Dissecting Starbucks' beverage pipeline, vertical supply chain, and competitive moat.", duration: "41m" },
      { id: "tj-s3e3", number: 12, title: "IRR", description: "Running the projections and stress-testing the bull case against every bear scenario.", duration: "39m" },
      { id: "tj-s3e4", number: 13, title: "The Report", description: "Presenting the 12-page equity analysis to the fund. Five analysts. One conviction.", duration: "44m" },
    ],
    featured: true,
  },
];

export function getTitleById(id: string): Title | undefined {
  return TITLES.find((t) => t.id === id);
}

export function getTitlesByBrand(brandId: string): Title[] {
  return TITLES.filter((t) => t.brand === brandId);
}

export function getTitlesByType(type: "movie" | "series"): Title[] {
  return TITLES.filter((t) => t.type === type);
}

export function getTitlesByCategory(category: TitleCategory): Title[] {
  return TITLES.filter((t) => t.category === category);
}

export function getFeaturedTitles(): Title[] {
  return TITLES.filter((t) => t.featured);
}

export function getSliderTitles(): Title[] {
  return TITLES.filter((t) => t.featured).slice(0, 4);
}

export function searchTitles(query: string): Title[] {
  const q = query.toLowerCase();
  return TITLES.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.genres.some((g) => g.toLowerCase().includes(q)) ||
      t.tagline.toLowerCase().includes(q)
  );
}
