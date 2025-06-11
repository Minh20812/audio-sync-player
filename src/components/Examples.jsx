import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Youtube, Music, ChevronDown, ChevronUp } from "lucide-react";
import { parseVideoUrls } from "@/utils/videoUtils";

const Examples = ({ onSelectExample }) => {
  const [videos, setVideos] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const loadVideos = async () => {
      const videoList = await parseVideoUrls();
      setVideos(videoList);
    };
    loadVideos();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(videos.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = videos.slice(indexOfFirstItem, indexOfLastItem);

  // Show all items when expanded
  const displayedItems = isExpanded ? videos : currentItems;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">Try These Examples:</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="grid gap-3">
          {displayedItems.map((video) => (
            <div
              key={video.id}
              className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={video.thumbnail}
                  alt={`Thumbnail for ${video.id}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />

                <div className="space-y-1">
                  <h4 className="text-white font-medium">{video.title}</h4>

                  <p className="text-sm text-gray-400">{video.channel}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onSelectExample(video.id)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </Button>
            </div>
          ))}
        </div>

        {!isExpanded && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                size="sm"
                variant={currentPage === index + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(index + 1)}
                className={
                  currentPage === index + 1
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "text-gray-400 hover:text-white"
                }
              >
                {index + 1}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Examples;
