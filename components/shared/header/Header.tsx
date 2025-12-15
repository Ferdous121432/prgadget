import Menu from "./Menus";
import AppLogo from "./AppLogo";
import CategoryDrawer from "./CategoryDrawer";
import Search from "./Search";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <div className="lg:hidden">
            <CategoryDrawer />
          </div>
          <AppLogo />
        </div>

        <div className="hidden md:block">
          <Search />
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
