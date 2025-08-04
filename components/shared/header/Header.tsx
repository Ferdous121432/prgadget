import Image from "next/image";
import Link from "next/link";
import { APP_LOGO, APP_Name } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import ModeToggle from "./ModeToggle";
import Menu from "./menu";
// import CategoryDrawer from "./category-drawer";
// import Search from "./search";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          {/* <CategoryDrawer /> */}
          <Link href="/" className="flex-start ml-4">
            <Image
              src={APP_LOGO}
              alt={`${APP_Name} logo`}
              height={48}
              width={144}
              priority={true}
            />
            {/* <span className="hidden lg:block font-bold text-2xl ml-3">
              {APP_Name}
            </span> */}
          </Link>
        </div>

        {/* <div className="hidden md:block"><Search /></div> */}
        <Menu />
      </div>
    </header>
  );
};

export default Header;
