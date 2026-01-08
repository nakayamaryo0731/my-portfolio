export const SITE_OWNER = {
  name: "Ryo Nakayama",
  jobTitle: "Software Engineer",
  country: "Japan",
  countryCode: "JP",
};

export const LINKS = {
  github: "https://github.com/nakayamaryo0731",
  linkedin: "https://www.linkedin.com/in/nakayama-ryo-707a86188/",
  x: "https://x.com/RONnakayama",
  email: "nakayamaryo0731@gmail.com",
};

export const loaderAnimation = [
  ".loader",
  { opacity: [1, 0], pointerEvents: "none" },
  { easing: "ease-out" },
];

// Post source badge styles (used in client-side scripts)
export const SOURCE_STYLES: Record<string, string> = {
  Blog: "bg-primary-500 text-white",
  Zenn: "bg-blue-500 text-white",
  note: "bg-green-600 text-white",
};

// External RSS feeds
export const RSS_FEEDS = {
  zenn: "https://zenn.dev/r0nr0n/feed",
  note: "https://note.com/ron0731/rss",
};

// External profile URLs
export const EXTERNAL_URLS = {
  zenn: "https://zenn.dev/r0nr0n",
  note: "https://note.com/ron0731",
};

export const GLOBE_CONFIG = {
  sensitivity: 75,
  rotateSpeed: 1,
  timerInterval: 200,
  visitedCountries: [
    "Japan",
    "Thailand",
    "Italy",
    "Finland",
    "Czechia",
    "USA", // Hawaii
  ],
  colors: {
    globe: "#EEE",
    visited: "#E63946",
    unvisited: "white",
    stroke: "black",
  },
};
