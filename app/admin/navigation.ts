import {
  IconAffiliate,
  IconBrandProducthunt,
  IconCategory,
  IconCategoryMinus,
  IconCategoryPlus,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHome,
  IconListDetails,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon?: Icon;
};

export const adminPrimaryNavItems: AdminNavItem[] = [
  {
    title: "Overview",
    href: "/admin/overview",
    icon: IconDashboard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: IconListDetails,
  },
  {
    title: "All Orders",
    href: "/admin/orders/all-orders",
    icon: IconFileAi,
  },
  {
    title: "Deleted Orders",
    href: "/admin/orders/deleted",
    icon: IconFileDescription,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: IconUsers,
  },
  {
    title: "Homepage",
    href: "/admin/homepage",
    icon: IconHome,
  },
];

export const adminCatalogNavItems: AdminNavItem[] = [
  {
    title: "Products",
    href: "/admin/products",
    icon: IconBrandProducthunt,
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: IconAffiliate,
  },
  {
    title: "Category Tags",
    href: "/admin/category-tags",
    icon: IconAffiliate,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: IconCategory,
  },
  {
    title: "Sub Categories",
    href: "/admin/sub-categories",
    icon: IconCategoryPlus,
  },
  {
    title: "Sub Sub Categories",
    href: "/admin/sub-sub-categories",
    icon: IconCategoryMinus,
  },
];

export const adminAllNavItems = [
  ...adminPrimaryNavItems,
  ...adminCatalogNavItems,
];
