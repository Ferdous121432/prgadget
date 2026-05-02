import {
  STATIC_NAV_CATEGORIES,
  type StaticNavCategory,
} from "@/lib/constants/navigation";

import MegaMenu, { type Category } from "./MegaMenu";

function mapCategoryTree(category: StaticNavCategory): Category {
  return {
    id: category.id,
    name: category.name.trim(),
    slug: category.slug,
    children: category.subcategories?.map((subCategory) => ({
      id: subCategory.id,
      name: subCategory.name.trim(),
      slug: subCategory.slug,
      children: subCategory.subsubcategories?.map((child) => ({
        id: child.id,
        name: child.name.trim(),
        slug: child.slug,
      })),
    })),
  };
}

export default function Navigation() {
  const categories = STATIC_NAV_CATEGORIES.map(mapCategoryTree);

  return <MegaMenu categories={categories} />;
}
