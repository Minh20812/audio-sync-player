import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
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
    const API_KEY_YOUTUBE = import.meta.env.VITE_YOUTUBE_API_KEY; // Sử dụng import.meta.env
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY_YOUTUBE}`
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
