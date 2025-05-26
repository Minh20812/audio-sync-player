export const extractSoundCloudTrackId = (url) => {
  try {
    const trackUrl = new URL(url);
    // Handle both full URLs and embed URLs
    const pathSegments = trackUrl.pathname.split("/");
    const trackId = pathSegments[pathSegments.length - 1];
    return trackId;
  } catch (error) {
    return null;
  }
};

// Add validation function
export const isSoundCloudUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "soundcloud.com";
  } catch {
    return false;
  }
};
