export const extractSoundCloudTrackId = (url) => {
  try {
    // Kiểm tra nếu url là ID trực tiếp
    if (/^\d+$/.test(url)) {
      return url;
    }

    // Kiểm tra nếu url là string rỗng hoặc không hợp lệ
    if (!url || typeof url !== "string") {
      return null;
    }

    // Thêm protocol nếu URL không có
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const trackUrl = new URL(url);

    // Xử lý các định dạng URL khác nhau
    const pathSegments = trackUrl.pathname.split("/").filter(Boolean);

    // Trường hợp URL tracks/123456
    if (pathSegments[0] === "tracks") {
      return pathSegments[1];
    }

    // Trường hợp URL cuối cùng là ID
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (/^\d+$/.test(lastSegment)) {
      return lastSegment;
    }

    return null;
  } catch (error) {
    console.error("Error extracting SoundCloud track ID:", error);
    return null;
  }
};

export const isSoundCloudUrl = (url) => {
  try {
    // Kiểm tra nếu url là ID trực tiếp
    if (/^\d+$/.test(url)) {
      return true;
    }

    // Kiểm tra nếu url là string rỗng hoặc không hợp lệ
    if (!url || typeof url !== "string") {
      return false;
    }

    // Thêm protocol nếu URL không có
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const parsed = new URL(url);
    return (
      parsed.hostname === "soundcloud.com" ||
      parsed.hostname.endsWith(".soundcloud.com")
    );
  } catch {
    return false;
  }
};
