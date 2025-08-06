import Image from "next/image";
import Link from "next/link";
import { APP_LOGO, APP_Name } from "@/lib/constants";
import Menu from "./menu";
import AppLogo from "./app-logo";

// import CategoryDrawer from "./category-drawer";
// import Search from "./search";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          {/* <CategoryDrawer /> */}
          <AppLogo />
        </div>

        {/* <div className="hidden md:block"><Search /></div> */}
        <Menu />
      </div>
    </header>
  );
};

export default Header;
