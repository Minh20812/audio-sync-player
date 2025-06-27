import React from "react";
import { Card } from "@/components/ui/card";

const LoadingDisplay = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      <Card className="overflow-hidden bg-black/20 backdrop-blur-sm border-white/10">
        <div className="aspect-video relative flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white">Đang tải video player...</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoadingDisplay;
