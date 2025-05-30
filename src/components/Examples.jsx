import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Youtube, Music, ChevronDown, ChevronUp } from "lucide-react";
import { exampleVideos } from "@/data/examples";

const Examples = ({ onSelectExample }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Calculate total pages
  const totalPages = Math.ceil(exampleVideos.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = exampleVideos.slice(indexOfFirstItem, indexOfLastItem);

  // Show all items when expanded
  const displayedItems = isExpanded ? exampleVideos : currentItems;

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
          {displayedItems.map((example) => (
            <div
              key={example.id}
              className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="space-y-1">
                <h4 className="text-white font-medium">{example.title}</h4>
                <p className="text-sm text-gray-400">{example.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    youtube.com/watch?v={example.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    archive.org/download/{example.id}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onSelectExample(example.id)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Try This
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

        {!isExpanded && exampleVideos.length > itemsPerPage && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-gray-400 hover:text-white"
            onClick={() => setIsExpanded(true)}
          >
            Show All ({exampleVideos.length} examples)
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Examples;
