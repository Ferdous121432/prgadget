import { Metadata } from "next";
import { deleteUser, getAllUsers } from "@/lib/actions/user.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Pagination from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/shared/DeteleDialog";
import { requireAdmin } from "@/lib/auth-guard";
import { User } from "@/lib/generated/prisma";
import MenuHomePage from "./MenuHomePage";

export const metadata: Metadata = {
  title: "Admin Users",
};

const AdminUserPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) => {
  await requireAdmin();

  const { page = "1", query: searchText } = await props.searchParams;

  //TODO: Implement homepage admin features
  // Image slider management
  // Featured products management
  // Latest products management
  // Promotional banners management
  // SEO settings management

  return (
    <div className="space-y-2  flex flex-row gap-10">
      <MenuHomePage />

      <div></div>
    </div>
  );
};

export default AdminUserPage;
