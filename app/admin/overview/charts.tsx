"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const Charts = ({
  data,
}: {
  data: { month: string; totalSales: number }[];
}) => {
  console.log("Sales Data:", data);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="totalSales"
          fill="#334155"
          radius={[4, 4, 0, 0]}
          className="text-md font-bold   "
          label={{
            position: "middle",
            fill: "#fff",
            formatter: (label: React.ReactNode) =>
              typeof label === "number" ? `$${label}` : label,
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Charts;
