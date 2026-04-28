export type DisneyView =
  | "home"
  | "search"
  | "watchlist"
  | "movies"
  | "series"
  | "originals"
  | "detail";

export type TitleType = "movie" | "series";

export type TitleCategory = "recommend" | "new" | "original" | "trending" | "projects" | "personal-ventures" | "intern-pictures";

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
}

export interface Title {
  id: string;
  type: TitleType;
  title: string;
  subTitle: string;
  tagline: string;
  description: string;
  year: number;
  rating: string;
  runtime?: string;
  seasons?: number;
  genres: string[];
  brand: string;
  category: TitleCategory;
  cardImage: string;
  backgroundImage: string;
  titleImage?: string;
  videoPreview?: string;
  cast?: string[];
  director?: string;
  episodes?: Episode[];
  fallbackGradient: string;
  featured?: boolean;
  sliderImage?: string;
}

export interface Brand {
  id: string;
  name: string;
  tileImage?: string;
  hoverVideo?: string;
  tileColor: string;
  accentColor: string;
  description: string;
}
