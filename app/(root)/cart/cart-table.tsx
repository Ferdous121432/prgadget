import {
  CartActionButton,
  type CartActionState,
} from "@/components/shared/product/add-to-cart";
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/lib/actions/cart.actions";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type CartItem = {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  image: string;
  price: string;
};

type Cart = {
  items: CartItem[];
  itemsPrice: number | string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatCurrency(amount: number | string | null) {
  if (amount === null) {
    return "NaN";
  }

  return currencyFormatter.format(Number(amount));
}

const iconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";

const primaryButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90";

// NOTE: The code here has changed from the original course code so that the
// Each button submits its own server action so the cart page stays server-rendered.
function AddButton({ item }: { item: CartItem }) {
  return (
    <CartActionButton
      action={async (_state: CartActionState) => {
        "use server";
        return await addItemToCart(item);
      }}
      className={iconButtonClassName}
      ariaLabel={`Add ${item.name} to cart`}>
      <Plus className="w-4 h-4" />
    </CartActionButton>
  );
}

function RemoveButton({ item }: { item: CartItem }) {
  return (
    <CartActionButton
      action={async (_state: CartActionState) => {
        "use server";
        return await removeItemFromCart(item.productId);
      }}
      className={iconButtonClassName}
      ariaLabel={`Decrease ${item.name} quantity`}>
      <Minus className="w-4 h-4" />
    </CartActionButton>
  );
}

function RemoveRowButton({ item }: { item: CartItem }) {
  return (
    <CartActionButton
      action={async (_state: CartActionState) => {
        "use server";
        return await updateCartItemQuantity(item.productId, 0);
      }}
      className={iconButtonClassName}
      ariaLabel={`Remove ${item.name} from cart`}>
      <Trash2 className="w-4 h-4" />
    </CartActionButton>
  );
}

const CartTable = ({ cart }: { cart?: Cart }) => {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                    Item
                  </th>
                  <th className="h-10 px-2 text-center align-middle font-medium whitespace-nowrap">
                    Quantity
                  </th>
                  <th className="h-10 px-2 text-right align-middle font-medium whitespace-nowrap">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {cart.items.map((item) => (
                  <tr
                    key={item.slug}
                    className={
                      cart.items.indexOf(item) % 2 === 1
                        ? "border-b bg-slate-200 dark:bg-stone-950"
                        : "border-b"
                    }>
                    <td className="p-2 align-middle whitespace-nowrap">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className="px-2">{item.name}</span>
                        </Link>
                        <RemoveRowButton item={item} />
                      </div>
                    </td>
                    <td className="p-2 align-middle whitespace-nowrap">
                      <div className="flex-center gap-2">
                        <RemoveButton item={item} />
                        <span>{item.quantity}</span>
                        <AddButton item={item} />
                      </div>
                    </td>
                    <td className="p-2 text-right align-middle whitespace-nowrap">
                      ${item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card text-card-foreground flex flex-col gap-2 rounded-xl border pb-6 shadow-sm">
            <div className="px-6 pt-4">
              <div className="pb-3 text-xl">
                Subtotal ({cart.items.reduce((a, c) => a + c.quantity, 0)}):
                <span className="font-bold">
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              <Link href="/shipping-address" className={primaryButtonClassName}>
                <ArrowRight className="w-4 h-4" />
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartTable;
