import type { CartItem } from "@/types";

export function mergeCartItems(
  existingItems: CartItem[],
  incomingItems: CartItem[],
) {
  const mergedItems = existingItems.map((item) => ({ ...item }));

  for (const incomingItem of incomingItems) {
    const existingItem = mergedItems.find(
      (item) => item.productId === incomingItem.productId,
    );

    if (existingItem) {
      existingItem.quantity += incomingItem.quantity;
      continue;
    }

    mergedItems.push({ ...incomingItem });
  }

  return mergedItems;
}
