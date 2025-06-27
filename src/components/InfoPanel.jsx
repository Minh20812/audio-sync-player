import React from "react";
import { Card } from "@/components/ui/card";

const InfoPanel = ({
  validVideoId,
  youtubeUrl,
  audioRef,
  audioUrl,
  isMobile,
}) => {
  if (!validVideoId || !youtubeUrl) return null;

  return (
    <Card className="p-4 md:p-6 bg-white/10 backdrop-blur-sm border-white/20">
      <div
        className={`${isMobile ? "space-y-4" : "grid md:grid-cols-2 gap-6"}`}
      >
        <div className="space-y-2">
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full flex-shrink-0"></span>
            Video YouTube
          </h3>
          <p className="text-gray-300 text-xs md:text-sm break-all">
            {youtubeUrl}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
            Audio Archive.org
          </h3>
          <p className="text-gray-300 text-xs md:text-sm break-all">
            {audioRef.current?.currentSrc ||
              (audioUrl.length > 0 ? audioUrl[0][0] : "N/A")}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default InfoPanel;
