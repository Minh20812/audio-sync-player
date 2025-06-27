import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const ErrorDisplay = ({ error, videoId, validVideoId }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      <Card className="overflow-hidden bg-red-500/20 backdrop-blur-sm border-red-500/30">
        <div className="aspect-video relative flex items-center justify-center bg-red-900/20">
          <div className="text-center space-y-4 p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h3 className="text-xl font-semibold text-red-200">
              Lỗi Video Player
            </h3>
            <p className="text-red-300 max-w-md">{error}</p>
            <div className="space-y-2 text-sm text-red-400">
              <p>
                <strong>Video ID được cung cấp:</strong> {videoId}
              </p>
              {validVideoId && (
                <p>
                  <strong>Video ID hợp lệ:</strong> {validVideoId}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ErrorDisplay;
