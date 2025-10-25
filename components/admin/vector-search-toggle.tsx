"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function VectorSearchToggle({
  currentState,
}: {
  currentState: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleVectorSearch = (enabled: boolean) => {
    const params = new URLSearchParams(searchParams);

    if (enabled) {
      params.set("vectorSearch", "true");
    } else {
      params.delete("vectorSearch");
    }

    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="vector-search"
        checked={currentState}
        onCheckedChange={toggleVectorSearch}
      />
      <Label htmlFor="vector-search" className="text-sm">
        AI Search
      </Label>
    </div>
  );
}
