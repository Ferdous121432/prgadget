import { Cart } from "@/types";
import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";

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
