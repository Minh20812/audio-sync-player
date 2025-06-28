import React, { createContext, useContext, useState, ReactNode } from "react";

const VideoContext = createContext(undefined);

export const VideoProvider = ({ children }) => {
  const [selectedVideos, setSelectedVideos] = useState([]);

  const addVideo = (video) => {
    setSelectedVideos((prev) => {
      if (prev.some((v) => v.id === video.id)) return prev;
      return [...prev, video];
    });
  };

  const removeVideo = (videoId) => {
    setSelectedVideos((prev) => prev.filter((v) => v.id !== videoId));
  };

  const clearVideos = () => {
    setSelectedVideos([]);
  };

  const isVideoSelected = (videoId) => {
    return selectedVideos.some((v) => v.id === videoId);
  };

  return (
    <VideoContext.Provider
      value={{
        selectedVideos,
        addVideo,
        removeVideo,
        clearVideos,
        isVideoSelected,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within VideoProvider");
  }
  return context;
};
