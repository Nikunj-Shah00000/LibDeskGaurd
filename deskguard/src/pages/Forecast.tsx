import { motion } from "framer-motion";
import {
  useGetOccupancyForecast,
  useGetNoiseHeatmap,
  useGetStats,
  getGetOccupancyForecastQueryKey,
  getGetNoiseHeatmapQueryKey,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Volume2, VolumeX, Volume1, AlertTriangle } from "lucide-react";

const NOISE_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string; bg: string }> = {
  quiet: { color: "#556B2F", bg: "rgba(85,107,47,0.08)", icon: <VolumeX size={16} />, label: "Quiet" },
  moderate: { color: "#D4960A", bg: "rgba(212,150,10,0.08)", icon: <Volume1 size={16} />, label: "Moderate" },
  noisy: { color: "#B23A48", bg: "rgba(178,58,72,0.08)", icon: <Volume2 size={16} />, label: "Noisy" },
  unknown: { color: "#9E9E9E", bg: "rgba(158,158,158,0.08)", icon: <AlertTriangle size={16} />, label: "No Data" },
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "#556B2F",
  medium: "#D4960A",
  low: "#9E9E9E",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  return (
    <div className="bg-card border border-border rounded-sm p-3 shadow-md">
      <p className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-black text-foreground">{val}%</p>
      <p className="text-[10px] text-muted-foreground font-medium">predicted occupancy</p>
    </div>
  );
}

export default function Forecast() {
  const { data: forecast = [], isLoading: forecastLoading } = useGetOccupancyForecast({
    query: { queryKey: getGetOccupancyForecastQueryKey(), refetchInterval: 5 * 60 * 1000 },
  });
  const { data: heatmap = [], isLoading: heatmapLoading } = useGetNoiseHeatmap({
    query: { queryKey: getGetNoiseHeatmapQueryKey(), refetchInterval: 2 * 60 * 1000 },
  });
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey(), refetchInterval: 30000 } });

  const currentHour = new Date().getHours();
  const chartData = forecast.map((f) => ({
    name: f.label,
    occupancy: f.predictedOccupancy,
    confidence: f.confidence,
  }));

  const peakPoint = forecast.reduce<typeof forecast[number] | null>((max, f) => 
    (!max || f.predictedOccupancy > max.predictedOccupancy) ? f : max
  , null);

  return (
    <div className="min-h-screen bg-background" data-testid="page-forecast">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-12 pt-20 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-muted-foreground mb-2">
            Smart Analytics
          </p>
          <div className="flex items-end gap-4 flex-wrap">
            <h1
              className="font-black uppercase leading-none text-foreground"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em" }}
            >
              Plan
            </h1>
            <h1
              className="font-black uppercase leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em", color: "#556B2F" }}
            >
              Smarter.
            </h1>
          </div>
        </motion.div>

        {/* Current snapshot */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            {[
              { value: `${stats.occupancyRate}%`, label: "Right Now", color: "#4E342E", bg: "rgba(78,52,46,0.08)" },
              { value: stats.available, label: "Available", color: "#556B2F", bg: "rgba(85,107,47,0.08)" },
              { value: stats.occupied + stats.away, label: "In Use", color: "#B23A48", bg: "rgba(178,58,72,0.08)" },
              { value: peakPoint ? `${peakPoint.predictedOccupancy}%` : "—", label: "Forecast Peak", color: "#D4960A", bg: "rgba(212,150,10,0.08)" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-sm p-4 border"
                style={{ background: s.bg, borderColor: s.color + "40" }}
              >
                <span
                  className="font-black leading-none block"
                  style={{ fontSize: "2rem", letterSpacing: "-0.04em", color: s.color }}
                >
                  {s.value}
                </span>
                <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-muted-foreground mt-1 block">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Forecast chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2 bg-card border border-border rounded-sm p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
                Occupancy Forecast — Next 8 Hours
              </p>
              <div className="flex items-center gap-3">
                {Object.entries(CONFIDENCE_COLORS).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: v }} />
                    <span className="text-[8px] font-bold uppercase text-muted-foreground">{k}</span>
                  </div>
                ))}
              </div>
            </div>

            {forecastLoading ? (
              <div className="h-56 bg-muted rounded-sm animate-pulse" />
            ) : chartData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4E342E" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#4E342E" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,26,23,0.08)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#9E9E9E", fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#9E9E9E", fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={80} stroke="#B23A48" strokeDasharray="4 4" strokeWidth={1} />
                    <Area
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#4E342E"
                      strokeWidth={2}
                      fill="url(#forecastGrad)"
                      dot={(props) => {
                        const conf = chartData[props.index]?.confidence;
                        const color = CONFIDENCE_COLORS[conf] ?? "#9E9E9E";
                        return <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill={color} stroke="#FAF4EC" strokeWidth={1.5} />;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No forecast data available</p>
              </div>
            )}

            {forecast.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground mb-2">Recommendations</p>
                <div className="flex flex-col gap-1.5">
                  {forecast.some((f) => f.predictedOccupancy < 50) && (
                    <p className="text-xs text-foreground">
                      <span className="font-bold" style={{ color: "#556B2F" }}>Best time:</span>{" "}
                      {forecast.filter((f) => f.predictedOccupancy < 50).map(f => f.label).slice(0,2).join(", ")} — low occupancy predicted
                    </p>
                  )}
                  {peakPoint && peakPoint.predictedOccupancy > 75 && (
                    <p className="text-xs text-foreground">
                      <span className="font-bold" style={{ color: "#B23A48" }}>Avoid:</span>{" "}
                      {peakPoint.label} — peak occupancy of {peakPoint.predictedOccupancy}% expected
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Noise Heatmap */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
                Noise Heatmap
              </p>
              <motion.div
                className="w-2 h-2 rounded-full bg-accent"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mb-4 leading-relaxed">
              Community-reported noise levels in the last 30 minutes.
            </p>

            {heatmapLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-sm animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {heatmap.map((zone, i) => {
                  const cfg = NOISE_CONFIG[zone.level] ?? NOISE_CONFIG.unknown;
                  return (
                    <motion.div
                      key={zone.zone}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      className="rounded-sm p-4 border flex items-center gap-4"
                      style={{ background: cfg.bg, borderColor: cfg.color + "40" }}
                    >
                      <div
                        className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                        style={{ background: cfg.color + "20", color: cfg.color }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-foreground">Zone {zone.zone}</span>
                          <span
                            className="text-[9px] font-extrabold tracking-[0.1em] uppercase"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-muted rounded-full h-1">
                            <div
                              className="h-1 rounded-full transition-all"
                              style={{
                                background: cfg.color,
                                width: zone.level === "noisy" ? "100%" : zone.level === "moderate" ? "55%" : zone.level === "quiet" ? "20%" : "0%",
                              }}
                            />
                          </div>
                          <span className="text-[8px] text-muted-foreground font-semibold">
                            {zone.reportCount} report{zone.reportCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground mb-2">How it works</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Report noise levels from the Library Map when viewing a seat. Reports expire after 30 minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
