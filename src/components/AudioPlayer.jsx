import React from "react";

const AudioPlayer = ({
  audioRef,
  validVideoId,
  formattedArchiveFilename,
  audioUrl,
}) => {
  if (!validVideoId || formattedArchiveFilename.length === 0) return null;

  return (
    <audio
      controls
      preload="metadata"
      crossOrigin="anonymous"
      ref={audioRef}
      key={validVideoId}
    >
      {audioUrl.map(([src, type]) => (
        <source key={src} src={src} type={type} />
      ))}
      Trình duyệt của bạn không hỗ trợ audio.
    </audio>
  );
};

export default AudioPlayer;
