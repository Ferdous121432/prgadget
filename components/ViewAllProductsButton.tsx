import { Button } from "./ui/button";
import Link from "next/link";

const ViewAllProductsButton = ({ link }: { link: string }) => {
  return (
    <div className="flex justify-center items-center">
      <Button
        asChild
        className="px-8 py-4 text-md button-primary
       font-semibold">
        <Link href={link}>View All Products</Link>
      </Button>
    </div>
  );
};

export default ViewAllProductsButton;
