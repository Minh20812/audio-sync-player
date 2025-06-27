import React from "react";

const VideoPlayer = ({ videoContainerRef, children }) => {
  return (
    <div
      ref={videoContainerRef}
      data-fullscreen-container
      className="aspect-video relative"
    >
      <div id="youtube-player" className="absolute inset-0" />
      {children}
    </div>
  );
};

export default VideoPlayer;
