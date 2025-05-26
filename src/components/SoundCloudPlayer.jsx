// import React from "react";

// const SoundCloudPlayer = ({
//   trackUrl = "https://api.soundcloud.com/tracks/1420644586",
//   color = "ff5500",
//   autoPlay = false,
//   hideRelated = false,
//   showComments = true,
//   showUser = true,
//   showReposts = false,
//   showTeaser = true,
//   visual = true,
//   height = "300",
// }) => {
//   // Tạo URL embed từ các props
//   const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
//     trackUrl
//   )}&color=%23${color}&auto_play=${autoPlay}&hide_related=${hideRelated}&show_comments=${showComments}&show_user=${showUser}&show_reposts=${showReposts}&show_teaser=${showTeaser}&visual=${visual}`;

//   return (
//     <div className="w-full">
//       {/* SoundCloud Player */}
//       <iframe
//         width="100%"
//         height={height}
//         scrolling="no"
//         frameBorder="no"
//         allow="autoplay"
//         src={embedUrl}
//         className="border-0"
//         title="SoundCloud Player"
//       />

//       {/* Attribution Footer */}
//       <div className="text-xs text-gray-400 leading-tight overflow-hidden whitespace-nowrap text-ellipsis font-sans font-thin mt-1">
//         <a
//           href="https://soundcloud.com/user-467629254"
//           title="vytene.zygaityte"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-gray-400 no-underline hover:text-gray-300 transition-colors"
//         >
//           vytene.zygaityte
//         </a>
//         <span className="mx-1">·</span>
//         <a
//           href="https://soundcloud.com/user-467629254/babyelephantwalk60-484798065"
//           title="BabyElephantWalk60.wav"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-gray-400 no-underline hover:text-gray-300 transition-colors"
//         >
//           BabyElephantWalk60.wav
//         </a>
//       </div>
//     </div>
//   );
// };

// // Component với props mặc định cho track cụ thể
// const BabyElephantWalkPlayer = ({ idSoundCloud }) => {
//   return (
//     <SoundCloudPlayer
//       trackUrl={`https://api.soundcloud.com/tracks/${idSoundCloud}`}
//       color="ff5500"
//       autoPlay={false}
//       hideRelated={false}
//       showComments={true}
//       showUser={true}
//       showReposts={false}
//       showTeaser={true}
//       visual={true}
//       height="100"
//     />
//   );
// };

// // Export component chính
// export default BabyElephantWalkPlayer;

// // Cũng export component có thể tùy chỉnh
// export { SoundCloudPlayer };

import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

const SoundCloudPlayer = ({
  idSoundCloud,
  isPlaying,
  setIsPlaying,
  audioOffset,
}) => {
  const widgetRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Load SoundCloud Widget API
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    document.body.appendChild(script);

    script.onload = () => {
      const widget = window.SC.Widget("soundcloud-player");
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        isInitializedRef.current = true;
        // Set up event listeners
        widget.bind(window.SC.Widget.Events.PLAY, () => {
          setIsPlaying(true);
        });
        widget.bind(window.SC.Widget.Events.PAUSE, () => {
          setIsPlaying(false);
        });
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle play/pause from parent component
  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || !isInitializedRef.current) return;

    if (isPlaying) {
      widget.play();
    } else {
      widget.pause();
    }
  }, [isPlaying]);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-6">
        <h3 className="text-white font-semibold text-lg mb-4">
          SoundCloud Audio
        </h3>
        <iframe
          id="soundcloud-player"
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${idSoundCloud}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
        ></iframe>
      </CardContent>
    </Card>
  );
};

export default SoundCloudPlayer;
