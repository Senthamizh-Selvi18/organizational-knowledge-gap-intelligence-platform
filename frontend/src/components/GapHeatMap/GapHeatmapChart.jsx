import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

const getColor = (value) => {
  if (value <= 20) return "#22c55e"; // Green
  if (value <= 40) return "#facc15"; // Yellow
  if (value <= 60) return "#fb923c"; // Orange
  return "#ef4444"; // Red
};

function GapHeatmapChart({ data }) {
  return (
  <div className="rounded-3xl bg-panel p-8 shadow-xl mt-8">

    <div className="mb-8">

      <h2 className="text-3xl font-bold text-text">
        Department Knowledge Gap
      </h2>

      <p className="mt-2 text-sub">
        Average knowledge gap across all departments.
      </p>

    </div>

    <ResponsiveContainer width="100%" height={350}>

      <BarChart
        data={data}
        margin={{
          top: 30,
          right: 20,
          left: 10,
          bottom: 20,
        }}
      >

        <CartesianGrid strokeDasharray="5 5" />

        <XAxis
          dataKey="department"
        />

        <YAxis
          domain={[0,100]}
        />

        <Tooltip />

        <Bar
          dataKey="averageGapPercentage"
          radius={[12,12,0,0]}
        >

          <LabelList
            dataKey="averageGapPercentage"
            position="top"
            formatter={(value)=>`${value}%`}
          />

          {data.map((entry,index)=>(

            <Cell
              key={index}
              fill={getColor(entry.averageGapPercentage)}
            />

          ))}

        </Bar>

      </BarChart>

    </ResponsiveContainer>

    <div className="mt-8 flex justify-center gap-8 flex-wrap">

      <span className="flex items-center gap-2">
        🟢 Low
      </span>

      <span className="flex items-center gap-2">
        🟡 Moderate
      </span>

      <span className="flex items-center gap-2">
        🟠 High
      </span>

      <span className="flex items-center gap-2">
        🔴 Critical
      </span>

    </div>

  </div>

  );
}

export default GapHeatmapChart;