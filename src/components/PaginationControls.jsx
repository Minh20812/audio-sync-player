import React from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const PaginationControls = ({
  currentPage,
  totalPages,
  hasMore,
  isLoading,
  onPrevious,
  onNext,
  hideOnSearch = true,
  searchResult = null,
}) => {
  if (hideOnSearch && searchResult) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentPage === 1 || isLoading}
        className="text-gray-400 hover:text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto"
      >
        Previous
      </Button>
      <span className="text-white text-xs sm:text-sm order-first sm:order-none">
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin mx-auto" />
        ) : (
          `Page ${currentPage} of ${totalPages}`
        )}
      </span>
      <Button
        variant="outline"
        onClick={onNext}
        disabled={!hasMore || isLoading || currentPage === totalPages}
        className="text-gray-400 hover:text-white text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 w-full sm:w-auto"
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationControls;
