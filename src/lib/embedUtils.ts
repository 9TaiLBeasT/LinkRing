// Embed utility functions for detecting and handling different platform embeds

export interface EmbedData {
  type: string;
  id: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  author?: string;
  embedUrl?: string;
  originalUrl: string;
}

export type EmbedType =
  | "youtube"
  | "twitter"
  | "spotify"
  | "soundcloud"
  | "codepen"
  | "figma"
  | "canva"
  | null;

// Platform detection patterns
const PLATFORM_PATTERNS = {
  youtube: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
  ],
  twitter: [/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/],
  spotify: [/open\.spotify\.com\/(track|album|playlist|artist)\/([\w]+)/],
  soundcloud: [/soundcloud\.com\/([\w-]+)\/([\w-]+)/],
  codepen: [/codepen\.io\/([\w-]+)\/pen\/([\w-]+)/],
  figma: [
    /figma\.com\/file\/([\w-]+)\/([\w-]+)/,
    /figma\.com\/proto\/([\w-]+)\/([\w-]+)/,
  ],
  canva: [/canva\.com\/design\/([\w-]+)/],
};

/**
 * Detect the platform type from a URL
 */
export function detectPlatform(url: string): EmbedType {
  try {
    const normalizedUrl = url.toLowerCase();

    for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedUrl)) {
          return platform as EmbedType;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error detecting platform:", error);
    return null;
  }
}

/**
 * Extract embed data from a URL
 */
export function extractEmbedData(url: string): EmbedData | null {
  const platform = detectPlatform(url);
  if (!platform) return null;

  try {
    switch (platform) {
      case "youtube":
        return extractYouTubeData(url);
      case "twitter":
        return extractTwitterData(url);
      case "spotify":
        return extractSpotifyData(url);
      case "soundcloud":
        return extractSoundCloudData(url);
      case "codepen":
        return extractCodePenData(url);
      case "figma":
        return extractFigmaData(url);
      case "canva":
        return extractCanvaData(url);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error extracting ${platform} data:`, error);
    return null;
  }
}

/**
 * Extract YouTube video data
 */
function extractYouTubeData(url: string): EmbedData | null {
  const patterns = PLATFORM_PATTERNS.youtube;

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        type: "youtube",
        id: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        originalUrl: url,
      };
    }
  }

  return null;
}

/**
 * Extract Twitter/X data
 */
function extractTwitterData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.twitter[0]);
  if (match) {
    const tweetId = match[1];
    return {
      type: "twitter",
      id: tweetId,
      embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract Spotify data
 */
function extractSpotifyData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.spotify[0]);
  if (match) {
    const [, type, id] = match;
    return {
      type: "spotify",
      id: `${type}/${id}`,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract SoundCloud data
 */
function extractSoundCloudData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.soundcloud[0]);
  if (match) {
    const [, user, track] = match;
    return {
      type: "soundcloud",
      id: `${user}/${track}`,
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%2300ff9d&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract CodePen data
 */
function extractCodePenData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.codepen[0]);
  if (match) {
    const [, user, penId] = match;
    return {
      type: "codepen",
      id: `${user}/${penId}`,
      embedUrl: `https://codepen.io/${user}/embed/${penId}?default-tab=result&theme-id=dark`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract Figma data
 */
function extractFigmaData(url: string): EmbedData | null {
  const patterns = PLATFORM_PATTERNS.figma;

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const [, fileId] = match;
      return {
        type: "figma",
        id: fileId,
        embedUrl: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`,
        originalUrl: url,
      };
    }
  }

  return null;
}

/**
 * Extract Canva data
 */
function extractCanvaData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.canva[0]);
  if (match) {
    const [, designId] = match;
    return {
      type: "canva",
      id: designId,
      embedUrl: url, // Canva uses the original URL for embedding
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Generate embed HTML for a given embed data
 */
export function generateEmbedHtml(
  embedData: EmbedData,
  options: {
    width?: string;
    height?: string;
    className?: string;
  } = {},
): string {
  const { width = "100%", height = "400px", className = "" } = options;

  const baseProps = `width="${width}" height="${height}" class="${className}" frameborder="0" allowfullscreen`;

  switch (embedData.type) {
    case "youtube":
      return `<iframe src="${embedData.embedUrl}" ${baseProps} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>`;

    case "twitter":
      return `<iframe src="${embedData.embedUrl}" ${baseProps} scrolling="no"></iframe>`;

    case "spotify":
      return `<iframe src="${embedData.embedUrl}" ${baseProps} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;

    case "soundcloud":
      return `<iframe src="${embedData.embedUrl}" ${baseProps} allow="autoplay"></iframe>`;

    case "codepen":
      return `<iframe src="${embedData.embedUrl}" ${baseProps} loading="lazy" allowtransparency="true" allow="encrypted-media"></iframe>`;

    case "figma":
      return `<iframe src="${embedData.embedUrl}" ${baseProps} allowfullscreen></iframe>`;

    case "canva":
      return `<iframe src="${embedData.embedUrl}" ${baseProps} allowfullscreen></iframe>`;

    default:
      return "";
  }
}

/**
 * Check if a platform supports embedding
 */
export function isEmbeddable(url: string): boolean {
  return detectPlatform(url) !== null;
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(type: EmbedType): string {
  const names: Record<string, string> = {
    youtube: "YouTube",
    twitter: "Twitter/X",
    spotify: "Spotify",
    soundcloud: "SoundCloud",
    codepen: "CodePen",
    figma: "Figma",
    canva: "Canva",
  };

  return names[type || ""] || "Unknown";
}

/**
 * Get platform icon/emoji
 */
export function getPlatformIcon(type: EmbedType): string {
  const icons: Record<string, string> = {
    youtube: "📺",
    twitter: "🐦",
    spotify: "🎵",
    soundcloud: "🎧",
    codepen: "💻",
    figma: "🎨",
    canva: "🖼️",
  };

  return icons[type || ""] || "🔗";
}
