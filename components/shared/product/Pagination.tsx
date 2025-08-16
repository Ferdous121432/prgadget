// components/shared/pagination.tsx
import React from "react";
import {
  Pagination as PaginationUI,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string>;
}

function PaginationComponent({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  // Generate pagination range
  const generatePaginationRange = (current: number, total: number) => {
    const range: (number | string)[] = [];
    const showEllipsis = total > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= total; i++) {
        range.push(i);
      }
    } else {
      range.push(1);

      if (current <= 4) {
        for (let i = 2; i <= 5; i++) {
          range.push(i);
        }
        range.push("...");
        range.push(total);
      } else if (current >= total - 3) {
        range.push("...");
        for (let i = total - 4; i <= total; i++) {
          range.push(i);
        }
      } else {
        range.push("...");
        for (let i = current - 1; i <= current + 1; i++) {
          range.push(i);
        }
        range.push("...");
        range.push(total);
      }
    }

    return range;
  };

  // Create URL with page parameter
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams({
      ...searchParams,
      page: page.toString(),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const paginationRange = generatePaginationRange(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8">
      <PaginationUI>
        <PaginationContent>
          {/* Previous Button */}
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={createPageUrl(currentPage - 1)} />
            </PaginationItem>
          )}

          {/* Page Numbers */}
          {paginationRange.map((pageNum, index) => (
            <PaginationItem key={index}>
              {pageNum === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={createPageUrl(pageNum as number)}
                  isActive={currentPage === pageNum}>
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext href={createPageUrl(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </PaginationUI>
    </div>
  );
}

export default PaginationComponent;
