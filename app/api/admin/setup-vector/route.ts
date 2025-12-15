import { NextRequest, NextResponse } from "next/server";
import { syncAllProductsToVector } from "@/lib/actions/vector-search.actions";

export async function GET() {
  try {
    console.log("🚀 Setting up vector database...");

    const result = await syncAllProductsToVector();

    if (result.success) {
      console.log(`✅ Successfully synced ${result.synced} products`);
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.synced} products`,
        synced: result.synced,
      });
    } else {
      console.error("❌ Setup failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("💥 Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// # Then visit in browser or use curl:
// http://localhost:3000/api/admin/setup-vector
