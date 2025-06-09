export const getYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const parseVideoUrls = async () => {
  try {
    const response = await fetch("/videoYt.txt");
    const text = await response.text();

    // Split by lines and remove empty lines
    const urls = text
      .split("\n")
      .filter((line) => line.trim())
      .reverse(); // Reverse array to show latest entries first

    return urls
      .map((url) => ({
        id: getYouTubeVideoId(url),
        url: url.trim(),
      }))
      .filter((item) => item.id);
  } catch (error) {
    console.error("Error loading video URLs:", error);
    return [];
  }
};
