"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { syncAllProductsToVector } from "@/lib/actions/vector-search.actions";
import { jsxToasts } from "@/lib/customToaster";

export default function VectorSyncButton() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);

    try {
      const result = await syncAllProductsToVector();

      if (result.success) {
        jsxToasts.successWithIcon({
          title: "Sync Complete",
          message: `${result.synced} products synced to vector database`,
        });
      } else {
        jsxToasts.errorWithIcon("Sync Failed", result.error);
      }
    } catch (error) {
      jsxToasts.errorWithIcon("Sync Failed", "An unexpected error occurred");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
      {syncing ? "Syncing..." : "Sync Vector DB"}
    </Button>
  );
}
