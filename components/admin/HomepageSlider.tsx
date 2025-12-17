import DeleteDialog from "@/components/shared/DeteleDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteHomeSlider,
  getAllHomeSliders,
} from "@/lib/actions/homepage.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { formatId } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const AdminSliderPage = async () => {
  await requireAdmin();

  const sliders = (await getAllHomeSliders()) as any[];
  console.log("Sliders:", sliders);

  return (
    <div className="space-y-2">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <h1 className="h2-bold">Sliders</h1>
        </div>
        <Button asChild variant="default">
          <Link href="/admin/homepage/create-slider">Create Slider</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead className="text-right">Image</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sliders?.map((slider) => (
            <TableRow key={slider.id}>
              <TableCell>{formatId(slider.id)}</TableCell>
              <TableCell>{slider.name}</TableCell>

              <TableCell>
                <Image
                  src={slider.image_url}
                  alt={slider.name_url}
                  width={100}
                  height={50}
                  className="object-cover rounded"
                />
              </TableCell>

              <TableCell className="flex gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/products/${slider.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={slider.id} action={deleteHomeSlider} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminSliderPage;
