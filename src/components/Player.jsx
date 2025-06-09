// import React from "react";
// import { useSearchParams } from "react-router-dom";
// import MediaSyncPlayer from "@/components/MediaSyncPlayer";

// const Player = () => {
//   const [searchParams] = useSearchParams();
//   const videoId = searchParams.get("v");

//   if (!videoId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
//         <div className="text-white text-center">
//           <h1 className="text-2xl font-bold mb-2">Invalid Video ID</h1>
//           <p>Please return to home page and select a valid video.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
//       <MediaSyncPlayer videoId={videoId} />
//     </div>
//   );
// };

// export default Player;

import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MediaSyncPlayer from "@/components/MediaSyncPlayer";

const Player = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("v");

  // Add YouTube API loading logic
  useEffect(() => {
    // Remove existing script if any
    const existingScript = document.getElementById("youtube-api");
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script
    const script = document.createElement("script");
    script.id = "youtube-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    // Add script to document
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.getElementById("youtube-api");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  if (!videoId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Video ID</h1>
          <p>Please return to home page and select a valid video.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <MediaSyncPlayer videoId={videoId} />
    </div>
  );
};

export default Player;
