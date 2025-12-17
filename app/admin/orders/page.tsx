import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

import { getOrderSummary } from "@/lib/actions/order.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { convertPrismaObjectToJSObject } from "@/lib/utils";
import data from "./data.json";

export default async function Page() {
  // Ensure the user is an admin
  await requireAdmin();

  // Fetch order summary data
  const summaryRaw = await getOrderSummary();
  if (!summaryRaw) {
    throw new Error("Order summary could not be loaded.");
  }
  const summary = convertPrismaObjectToJSObject(summaryRaw);
  console.log("Order Summary:", summary);

  return (
    <div className="flex flex-1 flex-col">
      {/* Main content area */}
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
