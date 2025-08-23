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
  doc,
} from "firebase/firestore";
import db from "@/utils/firebaseConfig";
import { formatArchiveId } from "@/utils/archive";

export const getYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const fetchVideoInfo = async (videoId) => {
  try {
    // 1) Thử lấy từ YouTube API trước
    const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

    if (API_KEY) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const snippet = data.items[0].snippet;
            return {
              id: videoId,
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
          }
        }
      } catch (apiError) {
        console.warn("YouTube API failed:", apiError.message);
      }
    }

    // 2) Fallback: Tìm trong Firestore collection "latest_video_links"
    const colRef = collection(db, "latest_video_links");

    // 2.a) Thử tìm theo original_url với các format khác nhau
    const possibleUrls = [
      `https://www.youtube.com/watch?v=${videoId}`,
      `https://youtu.be/${videoId}`,
      `https://youtube.com/watch?v=${videoId}`,
      `https://www.youtube.com/embed/${videoId}`,
    ];

    let docSnap = null;

    for (const url of possibleUrls) {
      try {
        const querySnapshot = await getDocs(
          query(colRef, where("original_url", "==", url), limit(1))
        );

        if (!querySnapshot.empty) {
          docSnap = querySnapshot.docs[0];
          break;
        }
      } catch (queryError) {
        console.warn(`Query failed for URL ${url}:`, queryError.message);
        continue;
      }
    }

    // 2.b) Nếu không tìm thấy theo URL, thử tìm theo videoId field (nếu có)
    if (!docSnap) {
      try {
        const queryByVideoId = await getDocs(
          query(colRef, where("videoId", "==", videoId), limit(1))
        );

        if (!queryByVideoId.empty) {
          docSnap = queryByVideoId.docs[0];
        }
      } catch (queryError) {
        console.warn("Query by videoId failed:", queryError.message);
      }
    }

    // 2.c) Thử tìm document có ID trùng với videoId
    if (!docSnap) {
      try {
        const directDoc = await getDoc(doc(colRef, videoId));
        if (directDoc.exists()) {
          docSnap = directDoc;
        }
      } catch (docError) {
        console.warn("Direct document fetch failed:", docError.message);
      }
    }

    // 3) Xử lý dữ liệu từ Firestore nếu tìm thấy
    if (docSnap && docSnap.exists()) {
      const data = docSnap.data();

      // Parse thumbnail data
      let thumbnailUrl = null;
      if (data.all_thumbnails) {
        // Ưu tiên medium, sau đó high, default
        thumbnailUrl =
          data.all_thumbnails.medium ||
          data.all_thumbnails.high ||
          data.all_thumbnails.default;
      }

      // Fallback thumbnail nếu không có
      if (!thumbnailUrl) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }

      // Parse upload date
      let uploadDate = null;
      if (data.createdAt) {
        // Nếu là Firestore Timestamp
        if (
          data.createdAt.toDate &&
          typeof data.createdAt.toDate === "function"
        ) {
          uploadDate = data.createdAt.toDate().toISOString();
        } else if (data.createdAt._seconds) {
          // Nếu là Timestamp object
          uploadDate = new Date(data.createdAt._seconds * 1000).toISOString();
        } else {
          uploadDate = data.createdAt;
        }
      }

      return {
        id: videoId,
        title: data.title || "Unknown Title",
        channel: data.channel || "Unknown Channel",
        channelUrl: data.channel_url || null,
        description: data.description || "",
        thumbnail: thumbnailUrl,
        uploadDate: uploadDate,
        duration: data.duration || 0,
        viewCount: data.view_count || null,
        isShort: data.is_short || false,
        processed: data.processed || false,
        subtitleCodes: data.subtitle_codes || null,
        source: "firestore",
      };
    }

    // 4) Nếu không tìm thấy gì, trả về fallback data
    console.warn(`No data found for video ID: ${videoId}`);
    return {
      id: videoId,
      title: "Video Added",
      channel: "Unknown Channel",
      channelUrl: null,
      description: "No description available",
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      uploadDate: null,
      duration: 0,
      viewCount: null,
      isShort: false,
      processed: false,
      subtitleCodes: null,
      source: "fallback",
    };
  } catch (error) {
    console.error("Error in fetchVideoInfo:", error);

    // Fallback cuối cùng để UI không bị crash
    return {
      id: videoId,
      title: "Error Loading Video",
      channel: "Unknown Channel",
      channelUrl: null,
      description: "An error occurred while loading video information",
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      uploadDate: null,
      duration: 0,
      viewCount: null,
      isShort: false,
      processed: false,
      subtitleCodes: null,
      source: "error_fallback",
      error: error.message,
    };
  }
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

export const fetchLatestVideosFromFirestore = async () => {
  try {
    // Sử dụng orderBy với trường createdAt giảm dần
    const q = query(
      collection(db, "latest_video_links"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const videos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return videos;
  } catch (error) {
    console.error("Error fetching videos from Firestore:", error);
    return [];
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
