import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllMainCategories } from "@/lib/actions/category.actions";
import { UpdateMainCategory } from "@/types";
import { SearchIcon } from "lucide-react";

const Search = async () => {
  const { data: categories } = (await getAllMainCategories()) as {
    data: UpdateMainCategory[];
    totalPages: number;
  };
  const categoryOptions = Array.isArray(categories) ? categories : [];

  return (
    <form action="/search" method="GET">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Select name="category">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="backdrop-blur bg-background/80">
            <SelectItem key="All" value="all">
              All
            </SelectItem>
            {categoryOptions.map((x: { id: string; name: string }) => (
              <SelectItem key={x.id} value={x.id}>
                {x.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          name="q"
          type="text"
          placeholder="Search..."
          className="md:w-[100px] lg:w-[300px]"
        />
        <Button className="button-primary">
          <SearchIcon />
        </Button>
      </div>
    </form>
  );
};

export default Search;
