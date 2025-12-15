"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function VectorSearchToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(searchParams.get("vectorSearch") === "true");
  }, [searchParams]);

  const toggleVectorSearch = (enabled: boolean) => {
    const params = new URLSearchParams(searchParams);

    if (enabled) {
      params.set("vectorSearch", "true");
    } else {
      params.delete("vectorSearch");
    }

    // Reset to page 1 when toggling search type
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  // Only show if there's a search query
  const hasQuery =
    searchParams.get("q") &&
    searchParams.get("q") !== "all" &&
    searchParams.get("q")?.trim() !== "";

  if (!hasQuery) return null;

  return (
    <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border">
      <Switch
        id="vector-search"
        checked={isEnabled}
        onCheckedChange={toggleVectorSearch}
      />
      <Label htmlFor="vector-search" className="text-sm font-medium">
        🤖 AI Search
      </Label>
      {isEnabled && (
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
          Semantic search enabled
        </span>
      )}
    </div>
  );
}
