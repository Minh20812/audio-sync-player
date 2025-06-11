export const getYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const fetchVideoInfo = async (videoId) => {
  try {
    const API_KEY = "AIzaSyAJ0c7uw_oSeB-b0mp2WmKtusVG1YVMXuI"; // Thay bằng API key của bạn
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
    );
    const data = await response.json();

    if (data.items && data.items[0]) {
      const { title, channelTitle } = data.items[0].snippet;
      return {
        id: videoId,
        title,
        channel: channelTitle,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching video info:", error);
    return null;
  }
};

export const parseVideoUrls = async () => {
  try {
    const response = await fetch("/videoYt.txt");
    const text = await response.text();

    const urls = text
      .split("\n")
      .filter((line) => line.trim())
      .reverse()
      .map((url) => getYouTubeVideoId(url))
      .filter((id) => id);

    const videoInfoPromises = urls.map((id) => fetchVideoInfo(id));
    const videoInfoResults = await Promise.all(videoInfoPromises);

    return videoInfoResults.filter((info) => info);
  } catch (error) {
    console.error("Error loading video URLs:", error);
    return [];
  }
};
