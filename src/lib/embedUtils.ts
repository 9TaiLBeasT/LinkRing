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
  | "instagram"
  | "tiktok"
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "google_docs"
  | "notion"
  | "github"
  | "dribbble"
  | "behance"
  | "vimeo"
  | "twitch"
  | null;

// Platform detection patterns
const PLATFORM_PATTERNS = {
  youtube: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i,
    /youtube\.com\/shorts\/([\w-]+)/i,
    /(?:www\.)?youtube\.com\/watch\?.*v=([\w-]+)/i,
    /(?:www\.)?youtu\.be\/([\w-]+)/i,
  ],
  twitter: [/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/],
  spotify: [/open\.spotify\.com\/(track|album|playlist|artist)\/([\w]+)/],
  soundcloud: [/soundcloud\.com\/([\w-]+)\/([\w-]+)/],
  codepen: [/codepen\.io\/([\w-]+)\/pen\/([\w-]+)/],
  figma: [
    /figma\.com\/file\/([A-Za-z0-9]+)\/([^?]+)/,
    /figma\.com\/proto\/([A-Za-z0-9]+)\/([^?]+)/,
    /figma\.com\/design\/([A-Za-z0-9]+)\/([^?]+)/,
  ],
  canva: [/canva\.com\/design\/([\w-]+)/],
  instagram: [
    /instagram\.com\/p\/([\w-]+)/,
    /instagram\.com\/reel\/([\w-]+)/,
    /instagram\.com\/reels\/([\w-]+)/,
  ],
  tiktok: [/tiktok\.com\/@[\w.-]+\/video\/(\d+)/, /vm\.tiktok\.com\/([\w-]+)/],
  pdf: [/\.(pdf)(\?.*)?$/i],
  docx: [/\.(docx?|doc)(\?.*)?$/i],
  xlsx: [/\.(xlsx?|xls)(\?.*)?$/i],
  pptx: [/\.(pptx?|ppt)(\?.*)?$/i],
  google_docs: [
    /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
    /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/,
  ],
  notion: [/notion\.so\/([\w-]+)/],
  github: [/github\.com\/([\w.-]+)\/([\w.-]+)/],
  dribbble: [/dribbble\.com\/shots\/([\d]+)/],
  behance: [/behance\.net\/gallery\/([\d]+)/],
  vimeo: [/vimeo\.com\/(\d+)/],
  twitch: [/twitch\.tv\/([\w]+)/],
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
  console.log("🔍 Extracting embed data for URL:", url);
  const platform = detectPlatform(url);
  console.log("🎯 Detected platform:", platform);

  if (!platform) {
    console.warn("❌ No platform detected for URL:", url);
    return null;
  }

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
      case "instagram":
        return extractInstagramData(url);
      case "tiktok":
        return extractTikTokData(url);
      case "pdf":
      case "docx":
      case "xlsx":
      case "pptx":
        return extractDocumentData(url, platform);
      case "google_docs":
        return extractGoogleDocsData(url);
      case "notion":
        return extractNotionData(url);
      case "github":
        return extractGitHubData(url);
      case "dribbble":
        return extractDribbbleData(url);
      case "behance":
        return extractBehanceData(url);
      case "vimeo":
        return extractVimeoData(url);
      case "twitch":
        return extractTwitchData(url);
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
  console.log("🎬 Extracting YouTube data for:", url);
  const patterns = PLATFORM_PATTERNS.youtube;

  for (const pattern of patterns) {
    console.log("🔍 Testing pattern:", pattern);
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      console.log("✅ Found YouTube video ID:", videoId);
      const embedData = {
        type: "youtube",
        id: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?controls=0&rel=0&modestbranding=1&showinfo=0&fs=0&disablekb=1&iv_load_policy=3&cc_load_policy=0&enablejsapi=1&origin=${window.location.origin}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        originalUrl: url,
      };
      console.log("📺 Created YouTube embed data:", embedData);
      return embedData;
    }
  }

  console.warn("❌ No YouTube pattern matched for URL:", url);
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
      const [, fileId, fileName] = match;
      return {
        type: "figma",
        id: fileId,
        title: fileName
          ? decodeURIComponent(fileName.replace(/-/g, " "))
          : "Figma Design",
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
 * Extract Instagram data
 */
function extractInstagramData(url: string): EmbedData | null {
  const patterns = PLATFORM_PATTERNS.instagram;

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const [, postId] = match;
      return {
        type: "instagram",
        id: postId,
        embedUrl: `https://www.instagram.com/p/${postId}/embed/`,
        originalUrl: url,
      };
    }
  }

  return null;
}

/**
 * Extract TikTok data
 */
function extractTikTokData(url: string): EmbedData | null {
  const patterns = PLATFORM_PATTERNS.tiktok;

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const [, videoId] = match;
      return {
        type: "tiktok",
        id: videoId,
        embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
        originalUrl: url,
      };
    }
  }

  return null;
}

/**
 * Extract Document data (PDF, Word, Excel, etc.)
 */
function extractDocumentData(url: string, type: string): EmbedData | null {
  const fileName = url.split("/").pop()?.split("?")[0] || "Document";

  return {
    type,
    id: fileName,
    title: fileName,
    embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
    originalUrl: url,
  };
}

/**
 * Extract Google Docs data
 */
function extractGoogleDocsData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.google_docs[0]);
  if (match) {
    const [, docId] = match;
    let embedUrl = "";
    let title = "Google Document";

    if (url.includes("/document/")) {
      embedUrl = `https://docs.google.com/document/d/${docId}/preview`;
      title = "Google Doc";
    } else if (url.includes("/spreadsheets/")) {
      embedUrl = `https://docs.google.com/spreadsheets/d/${docId}/preview`;
      title = "Google Sheet";
    } else if (url.includes("/presentation/")) {
      embedUrl = `https://docs.google.com/presentation/d/${docId}/preview`;
      title = "Google Slides";
    }

    return {
      type: "google_docs",
      id: docId,
      title,
      embedUrl,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract Notion data
 */
function extractNotionData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.notion[0]);
  if (match) {
    const [, pageId] = match;
    return {
      type: "notion",
      id: pageId,
      title: "Notion Page",
      embedUrl: url,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract GitHub data
 */
function extractGitHubData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.github[0]);
  if (match) {
    const [, owner, repo] = match;
    return {
      type: "github",
      id: `${owner}/${repo}`,
      title: `${owner}/${repo}`,
      embedUrl: `https://github.com/${owner}/${repo}`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract Dribbble data
 */
function extractDribbbleData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.dribbble[0]);
  if (match) {
    const [, shotId] = match;
    return {
      type: "dribbble",
      id: shotId,
      embedUrl: `https://dribbble.com/shots/${shotId}/player`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract Behance data
 */
function extractBehanceData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.behance[0]);
  if (match) {
    const [, projectId] = match;
    return {
      type: "behance",
      id: projectId,
      embedUrl: `https://www.behance.net/gallery/${projectId}`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract Vimeo data
 */
function extractVimeoData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.vimeo[0]);
  if (match) {
    const [, videoId] = match;
    return {
      type: "vimeo",
      id: videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Extract Twitch data
 */
function extractTwitchData(url: string): EmbedData | null {
  const match = url.match(PLATFORM_PATTERNS.twitch[0]);
  if (match) {
    const [, channel] = match;
    return {
      type: "twitch",
      id: channel,
      embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`,
      originalUrl: url,
    };
  }

  return null;
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
    instagram: "Instagram",
    tiktok: "TikTok",
    pdf: "PDF",
    docx: "Word Document",
    xlsx: "Excel Spreadsheet",
    pptx: "PowerPoint",
    google_docs: "Google Docs",
    notion: "Notion",
    github: "GitHub",
    dribbble: "Dribbble",
    behance: "Behance",
    vimeo: "Vimeo",
    twitch: "Twitch",
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
    instagram: "📸",
    tiktok: "🎬",
    pdf: "📄",
    docx: "📝",
    xlsx: "📊",
    pptx: "📋",
    google_docs: "📄",
    notion: "📝",
    github: "💻",
    dribbble: "🎨",
    behance: "🎨",
    vimeo: "🎥",
    twitch: "🎮",
  };

  return icons[type || ""] || "🔗";
}
