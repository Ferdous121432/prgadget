import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import type { CartItem } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "add") {
      const result = await addItemToCart(body.item as CartItem);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (body.action === "remove") {
      const result = await removeItemFromCart(body.productId as string);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json(
      { success: false, message: "Invalid cart action" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 },
    );
  }
}
