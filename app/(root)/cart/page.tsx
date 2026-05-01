import { getMyCart } from "@/lib/cart-data";
import { Cart } from "@/types";
import CartTable from "./cart-table";

export const metadata = {
  title: "Shopping Cart",
};

// Force dynamic rendering since we use cookies and session data
export const dynamic = "force-dynamic";

const CartPage = async () => {
  const cart = (await getMyCart()) as Cart;

  return (
    <>
      <CartTable cart={cart} />
    </>
  );
};

export default CartPage;
