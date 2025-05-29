import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Youtube, Music } from "lucide-react";
import { exampleVideos } from "@/data/examples";

const Examples = ({ onSelectExample }) => {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <h3 className="text-white font-medium mb-3">Try These Examples:</h3>
        <div className="grid gap-3">
          {exampleVideos.map((example) => (
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
      </CardContent>
    </Card>
  );
};

export default Examples;
