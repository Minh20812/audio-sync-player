import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  startAt,
  doc,
} from "firebase/firestore";
import db from "@/utils/firebaseConfig";
import { formatArchiveId } from "@/utils/archive";

export const getYouTubeVideoId = (input) => {
  // Nếu input đã là video ID (không chứa dấu / hoặc ?)
  if (input && !input.includes("/") && !input.includes("?")) {
    return input.trim();
  }

  // Nếu là URL, extract video ID
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = input.match(regex);
  return match ? match[1] : null;
};

const videoInfoCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 giờ

export const fetchVideoInfo = async (videoIds) => {
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const results = [];

  // Lọc ra những video đã có trong cache và còn valid
  const uncachedIds = [];
  const now = Date.now();

  for (const videoId of videoIds) {
    const cached = videoInfoCache.get(videoId);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      results.push(cached.data);
    } else {
      uncachedIds.push(videoId);
    }
  }

  // Nếu không có video nào cần fetch, return cached results
  if (uncachedIds.length === 0) {
    return results;
  }

  // YouTube API cho phép lấy tối đa 20 video trong 1 request
  const batchSize = 20;

  for (let i = 0; i < uncachedIds.length; i += batchSize) {
    const batch = uncachedIds.slice(i, i + batchSize);
    const batchIds = batch.join(",");

    try {
      if (API_KEY) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batchIds}&key=${API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();

          // Process từng video trong batch
          for (const item of data.items || []) {
            const snippet = item.snippet;
            const videoInfo = {
              id: item.id,
              title: snippet.title,
              channel: snippet.channelTitle,
              channelUrl: `https://www.youtube.com/channel/${snippet.channelId}`,
              description: snippet.description,
              thumbnail:
                snippet.thumbnails?.medium?.url ||
                snippet.thumbnails?.default?.url,
              uploadDate: snippet.publishedAt,
              source: "youtube_api",
            };

            // Cache kết quả
            videoInfoCache.set(item.id, {
              data: videoInfo,
              timestamp: now,
            });

            results.push(videoInfo);
          }

          // Đối với những video không có trong API response, fallback to Firestore
          const foundIds = data.items?.map((item) => item.id) || [];
          const missingIds = batch.filter((id) => !foundIds.includes(id));

          for (const missingId of missingIds) {
            try {
              const fallbackInfo = await fetchVideoInfoFromFirestore(missingId);
              if (fallbackInfo) {
                videoInfoCache.set(missingId, {
                  data: fallbackInfo,
                  timestamp: now,
                });
                results.push(fallbackInfo);
              }
            } catch (error) {
              console.warn(
                `Failed to fetch fallback info for ${missingId}:`,
                error
              );
            }
          }
        }
      } else {
        // Nếu không có API key, fallback to Firestore cho tất cả
        for (const videoId of batch) {
          try {
            const fallbackInfo = await fetchVideoInfoFromFirestore(videoId);
            if (fallbackInfo) {
              videoInfoCache.set(videoId, {
                data: fallbackInfo,
                timestamp: now,
              });
              results.push(fallbackInfo);
            }
          } catch (error) {
            console.warn(
              `Failed to fetch fallback info for ${videoId}:`,
              error
            );
          }
        }
      }

      // Thêm delay nhỏ giữa các batch để tránh rate limiting
      if (i + batchSize < uncachedIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error fetching batch:", error);
      // Fallback to Firestore for this batch
      for (const videoId of batch) {
        try {
          const fallbackInfo = await fetchVideoInfoFromFirestore(videoId);
          if (fallbackInfo) {
            results.push(fallbackInfo);
          }
        } catch (fallbackError) {
          console.warn(
            `Failed to fetch fallback info for ${videoId}:`,
            fallbackError
          );
        }
      }
    }
  }

  return results;
};

const fetchVideoInfoFromFirestore = async (videoId) => {
  try {
    const colRef = collection(db, "latest_video_links");

    // Thử các URL patterns khác nhau
    const possibleUrls = [
      `https://www.youtube.com/watch?v=${videoId}`,
      `https://youtu.be/${videoId}`,
    ];

    for (const url of possibleUrls) {
      const querySnapshot = await getDocs(
        query(colRef, where("original_url", "==", url), limit(1))
      );

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          id: videoId,
          title: data.title || "Unknown Title",
          channel: data.channel || "Unknown Channel",
          channelUrl: data.channel_url || null,
          description: data.description || "",
          thumbnail:
            data.all_thumbnails?.medium ||
            `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          uploadDate: data.createdAt?.toDate?.()?.toISOString() || null,
          source: "firestore",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching from Firestore:", error);
    return null;
  }
};

export const parseVideoUrlsFromDrive = async () => {
  try {
    const API_KEY_DRIVE = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
    const FILE_ID = "1MjemMq0ElZJktHRVnEsXlcR4NNo1x_ez";

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&key=${API_KEY_DRIVE}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file from Google Drive: ${response.status}`
      );
    }

    const text = await response.text();

    const urls = Array.from(
      new Set(
        text
          .split("\n")
          .filter((line) => line.trim())
          .reverse() // Đảo ngược thứ tự
          .map((url) => getYouTubeVideoId(url))
      )
    ).filter((id) => id);

    const videoInfoPromises = urls.map((id) => {
      const archiveId = formatArchiveId(id); // Định dạng archiveId
      const archiveUrl = `https://archive.org/download/${archiveId}/${id}.mp3`;
      return fetchVideoInfo(id, archiveUrl);
    });
    const videoInfoResults = await Promise.all(videoInfoPromises);

    const validVideos = videoInfoResults.filter((info) => info);

    const videosCollection = collection(db, "videos");
    let order = 0;

    for (const video of validVideos) {
      await addDoc(videosCollection, { ...video, order });
      order++;
    }

    return { validVideos, addedCount: validVideos.length };
  } catch (error) {
    console.error("Error loading video URLs from Google Drive:", error);
    return { validVideos: [], addedCount: 0 };
  }
};

export const fetchLatestVideosFromFirestore = async (
  page = 1,
  itemsPerPage = 4
) => {
  try {
    // Get total count first
    const totalQuery = query(
      collection(db, "latest_video_links"),
      orderBy("createdAt", "desc")
    );
    const totalSnapshot = await getDocs(totalQuery);
    const totalDocs = totalSnapshot.docs;
    const totalCount = totalDocs.length;

    // Calculate pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get paginated data using array slice
    const paginatedDocs = totalDocs.slice(startIndex, endIndex);
    const videos = paginatedDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      videos,
      totalCount,
      hasMore: endIndex < totalCount,
    };
  } catch (error) {
    console.error("Error fetching videos from Firestore:", error);
    return {
      videos: [],
      totalCount: 0,
      hasMore: false,
    };
  }
};

export const clearFirestoreVideos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "videos"));
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log("All videos cleared from Firestore.");
  } catch (error) {
    console.error("Error clearing videos from Firestore:", error);
  }
};

export const clearVideoInfoCache = () => {
  videoInfoCache.clear();
};

// 5. Thêm function để preload video info cho pagination
export const preloadNextPageVideos = async (
  startIndex,
  endIndex,
  allVideoUrls
) => {
  const videoIds = allVideoUrls
    .slice(startIndex, endIndex)
    .map((url) => url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1])
    .filter(Boolean);

  // Preload in background without blocking UI
  setTimeout(() => {
    fetchVideoInfo(videoIds);
  }, 500);
};

// export const parseVideoUrlsFromDrive = async () => {
//   try {
//     const API_KEY_DRIVE = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
//     const FILE_ID = "1MjemMq0ElZJktHRVnEsXlcR4NNo1x_ez";

//     const response = await fetch(
//       `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&key=${API_KEY_DRIVE}`
//     );

//     if (!response.ok) {
//       throw new Error(
//         `Failed to fetch file from Google Drive: ${response.status}`
//       );
//     }

//     const text = await response.text();

//     const urls = text
//       .split("\n")
//       .filter((line) => line.trim())
//       .reverse()
//       .map((url) => getYouTubeVideoId(url))
//       .filter((id) => id);

//     // Fetch video info for each video ID
//     const videoInfoPromises = urls.map((id) => fetchVideoInfo(id));
//     const videoInfoResults = await Promise.all(videoInfoPromises);

//     return videoInfoResults.filter((info) => info); // Loại bỏ các giá trị null
//   } catch (error) {
//     console.error("Error loading video URLs from Google Drive:", error);
//     return [];
//   }
// };

// export const fetchVideosFromFirestore = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, "videos"));
//     const videos = querySnapshot.docs
//       .map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       .sort((a, b) => a.order - b.order); // Sắp xếp theo trường order
//     return videos;
//   } catch (error) {
//     console.error("Error fetching videos from Firestore:", error);
//     return [];
//   }
// };

// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";
// import db from "@/utils/firebaseConfig";
// import { formatArchiveId } from "@/utils/archive";

// export const getYouTubeVideoId = (url) => {
//   const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
//   const match = url.match(regex);
//   return match ? match[1] : null;
// };

// export const fetchVideoInfo = async (videoId) => {
//   try {
//     const API_KEY_YOUTUBE = import.meta.env.VITE_YOUTUBE_API_KEY; // Sử dụng import.meta.env
//     const response = await fetch(
//       `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY_YOUTUBE}`
//     );
//     const data = await response.json();

//     if (data.items && data.items[0]) {
//       const { title, channelTitle } = data.items[0].snippet;
//       return {
//         id: videoId,
//         title,
//         channel: channelTitle,
//         thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
//       };
//     }
//     return null;
//   } catch (error) {
//     console.error("Error fetching video info:", error);
//     return null;
//   }
// };

// // export const parseVideoUrlsFromDrive = async () => {
// //   try {
// //     const API_KEY_DRIVE = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
// //     const FILE_ID = "1MjemMq0ElZJktHRVnEsXlcR4NNo1x_ez";

// //     const response = await fetch(
// //       `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&key=${API_KEY_DRIVE}`
// //     );

// //     if (!response.ok) {
// //       throw new Error(
// //         `Failed to fetch file from Google Drive: ${response.status}`
// //       );
// //     }

// //     const text = await response.text();

// //     const urls = text
// //       .split("\n")
// //       .filter((line) => line.trim())
// //       .reverse()
// //       .map((url) => getYouTubeVideoId(url))
// //       .filter((id) => id);

// //     // Fetch video info for each video ID
// //     const videoInfoPromises = urls.map((id) => fetchVideoInfo(id));
// //     const videoInfoResults = await Promise.all(videoInfoPromises);

// //     return videoInfoResults.filter((info) => info); // Loại bỏ các giá trị null
// //   } catch (error) {
// //     console.error("Error loading video URLs from Google Drive:", error);
// //     return [];
// //   }
// // };

// export const parseVideoUrlsFromDrive = async () => {
//   try {
//     const API_KEY_DRIVE = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
//     const FILE_ID = "1MjemMq0ElZJktHRVnEsXlcR4NNo1x_ez";

//     const response = await fetch(
//       `https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&key=${API_KEY_DRIVE}`
//     );

//     if (!response.ok) {
//       throw new Error(
//         `Failed to fetch file from Google Drive: ${response.status}`
//       );
//     }

//     const text = await response.text();

//     const urls = Array.from(
//       new Set(
//         text
//           .split("\n")
//           .filter((line) => line.trim())
//           .reverse() // Đảo ngược thứ tự
//           .map((url) => getYouTubeVideoId(url))
//       )
//     ).filter((id) => id);

//     const videoInfoPromises = urls.map((id) => {
//       const archiveId = formatArchiveId(id); // Định dạng archiveId
//       const archiveUrl = `https://archive.org/download/${archiveId}/${id}.mp3`;
//       return fetchVideoInfo(id, archiveUrl);
//     });
//     const videoInfoResults = await Promise.all(videoInfoPromises);

//     const validVideos = videoInfoResults.filter((info) => info);

//     const videosCollection = collection(db, "videos");
//     let order = 0;

//     for (const video of validVideos) {
//       await addDoc(videosCollection, { ...video, order });
//       order++;
//     }

//     return { validVideos, addedCount: validVideos.length };
//   } catch (error) {
//     console.error("Error loading video URLs from Google Drive:", error);
//     return { validVideos: [], addedCount: 0 };
//   }
// };

// export const fetchVideosFromFirestore = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, "videos"));
//     const videos = querySnapshot.docs
//       .map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       .sort((a, b) => a.order - b.order); // Sắp xếp theo trường order
//     return videos;
//   } catch (error) {
//     console.error("Error fetching videos from Firestore:", error);
//     return [];
//   }
// };

// export const clearFirestoreVideos = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, "videos"));
//     const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
//     await Promise.all(deletePromises);
//     console.log("All videos cleared from Firestore.");
//   } catch (error) {
//     console.error("Error clearing videos from Firestore:", error);
//   }
// };
