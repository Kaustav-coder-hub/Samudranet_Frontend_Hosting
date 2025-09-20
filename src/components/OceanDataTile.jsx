import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { WiDaySunny, WiRaindrop, WiBarometer } from "react-icons/wi";

const iconMap = {
  temperature: WiDaySunny,
  salinity: WiRaindrop,
  ph: WiBarometer,
};

const labelMap = {
  temperature: "Temperature",
  salinity: "Salinity",
  ph: "pH Level",
};

const unitMap = {
  temperature: "°C",
  salinity: "PSU",
  ph: "",
};

const colorMap = {
  temperature: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    line: "#f97316",
  },
  salinity: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    line: "#2563eb",
  },
  ph: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    line: "#7c3aed",
  },
};

export default function OceanDataTile({ type, data, isActive, onClick }) {
  if (!data || !data.points || data.points.length === 0) return null;

  const Icon = iconMap[type];
  const colors = colorMap[type];

  const values = data.points.map((p) => p.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const chartData = data.points.map((p, index) => ({
    index: index + 1,
    value: p.value,
    location: p.location || `Point ${index + 1}`,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-200 rounded shadow-sm">
          <p className="text-xs font-medium">{`Sample ${label}`}</p>
          <p className="text-xs" style={{ color: payload[0].color }}>
            {`${labelMap[type]}: ${payload[0].value.toFixed(2)}${
              unitMap[type]
            }`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <button
      onClick={() => onClick(type)}
      className={`w-full p-4 rounded-xl border transition-all ${
        isActive
          ? `${colors.bg} ${colors.border} border-2`
          : "border border-slate-200 hover:border-slate-300 bg-white"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`${colors.text} text-xl`} />
          <div className="text-left">
            <div className="text-sm font-medium text-slate-900">
              {labelMap[type]}
            </div>
            <div className="text-xs text-slate-500">Regional Data</div>
          </div>
        </div>
        <div className={`text-sm font-semibold ${colors.text}`}>
          {avg.toFixed(1)}
          {unitMap[type]}
        </div>
      </div>

      <div className="h-32 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="index"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
              tickLine={{ stroke: "#cbd5e1" }}
              label={{
                value: "Sample Points",
                position: "insideBottom",
                offset: -10,
                style: {
                  textAnchor: "middle",
                  fontSize: "10px",
                  fill: "#64748b",
                },
              }}
            />
            <YAxis
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
              tickLine={{ stroke: "#cbd5e1" }}
              label={{
                value: `${labelMap[type]} (${unitMap[type]})`,
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fontSize: "10px",
                  fill: "#64748b",
                },
              }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.line}
              strokeWidth={2.5}
              dot={{
                fill: colors.line,
                strokeWidth: 0,
                r: 3,
                fillOpacity: 0.8,
              }}
              activeDot={{
                r: 5,
                fill: colors.line,
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Min: {min.toFixed(1)}
          {unitMap[type]}
        </div>
        <div>
          Max: {max.toFixed(1)}
          {unitMap[type]}
        </div>
      </div>
    </button>
  );
}
