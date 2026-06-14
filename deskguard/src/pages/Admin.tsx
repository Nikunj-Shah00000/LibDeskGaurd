import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListSeats,
  useGetStats,
  useListActivity,
  useReleaseSeat,
  getListSeatsQueryKey,
  getGetStatsQueryKey,
  getListActivityQueryKey,
} from "@workspace/api-client-react";
import type { LibraryStats } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import type { Seat } from "@/components/SeatCard";

function BigStatCard({
  value,
  label,
  subLabel,
  color,
  bg,
  border,
  delay,
}: {
  value: number;
  label: string;
  subLabel: string;
  color: string;
  bg: string;
  border: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-sm p-6 border"
      style={{ background: bg, borderColor: border }}
      data-testid={`admin-stat-${label.toLowerCase()}`}
    >
      <span
        className="font-black leading-none block"
        style={{ fontSize: "4rem", letterSpacing: "-0.05em", color }}
      >
        {value}
      </span>
      <span className="text-sm font-extrabold tracking-[0.08em] uppercase block mt-2" style={{ color }}>
        {label}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block">{subLabel}</span>
    </motion.div>
  );
}

function OccupancyBar({ stats }: { stats: LibraryStats }) {
  const total = stats.total || 1;
  const segments = [
    { count: stats.occupied, color: "#B23A48", label: "Occupied" },
    { count: stats.away, color: "#D4960A", label: "Away" },
    { count: stats.abandoned, color: "#9E9E9E", label: "Abandoned" },
    { count: stats.available, color: "#556B2F", label: "Available" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
          Occupancy
        </span>
        <span className="text-2xl font-black text-foreground" style={{ letterSpacing: "-0.04em" }}>
          {stats.occupancyRate}%
        </span>
      </div>
      <div className="h-3 flex rounded-full overflow-hidden gap-px bg-muted">
        {segments.map((s) => (
          <motion.div
            key={s.label}
            initial={{ width: 0 }}
            animate={{ width: `${(s.count / total) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ background: s.color }}
            className="h-full"
          />
        ))}
      </div>
      <div className="flex gap-4 mt-3 flex-wrap">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {s.label} {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeakChart({ peakHours }: { peakHours: { hour: string; count: number }[] }) {
  const max = Math.max(...peakHours.map((h) => h.count), 1);
  const currentHour = new Date().getHours();

  return (
    <div>
      <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-4">
        Peak Hours
      </p>
      <div className="flex items-end gap-1 h-20">
        {peakHours.map((h, i) => {
          const heightPct = (h.count / max) * 100;
          const isNow = i === Math.min(Math.max(currentHour - 8, 0), peakHours.length - 1);
          return (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                className="w-full rounded-t-sm"
                style={{ background: isNow ? "#4E342E" : "#C8B9A8" }}
              />
              {i % 3 === 0 && (
                <span className="text-[7px] text-muted-foreground font-bold">{h.hour}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeatmapGrid({ zones }: { zones: LibraryStats["zoneBreakdown"] }) {
  return (
    <div>
      <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-4">
        Zone Heatmap
      </p>
      <div className="grid grid-cols-2 gap-3">
        {zones.map((z) => {
          const total = z.available + z.occupied + z.away + z.abandoned || 1;
          const heat = ((z.occupied + z.away) / total);
          const color = heat > 0.7 ? "#B23A48" : heat > 0.4 ? "#D4960A" : "#556B2F";
          return (
            <div
              key={z.zone}
              className="rounded-sm p-3 border"
              style={{ background: color + "14", borderColor: color + "40" }}
              data-testid={`heatmap-zone-${z.zone}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold tracking-[0.15em] uppercase" style={{ color }}>
                  Zone {z.zone}
                </span>
                <span className="text-sm font-black" style={{ color }}>
                  {Math.round(heat * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${heat * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 font-medium">
                {z.available} free / {z.occupied + z.away} in use
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Admin() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useGetStats({
    query: { queryKey: getGetStatsQueryKey(), refetchInterval: 15000 },
  });
  const { data: seats = [] } = useListSeats({
    query: { queryKey: getListSeatsQueryKey(), refetchInterval: 15000 },
  });
  const { data: activity = [] } = useListActivity({
    query: { queryKey: getListActivityQueryKey(), refetchInterval: 10000 },
  });

  const releaseSeat = useReleaseSeat({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSeatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListActivityQueryKey() });
      },
    },
  });

  const abandonedSeats = seats.filter((s) => s.status === "abandoned") as Seat[];

  const STATUS_COLORS: Record<string, string> = {
    available: "#556B2F",
    occupied: "#B23A48",
    away: "#D4960A",
    abandoned: "#9E9E9E",
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-admin">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-12 pt-20 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-muted-foreground mb-2">
            Admin Dashboard
          </p>
          <h1
            className="font-black uppercase leading-none text-foreground"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", letterSpacing: "-0.04em" }}
          >
            Overview
          </h1>
        </motion.div>

        {/* Big stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-sm animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <BigStatCard value={stats.available} label="Available" subLabel="Ready to occupy"
              color="#556B2F" bg="rgba(85,107,47,0.08)" border="rgba(85,107,47,0.2)" delay={0.2} />
            <BigStatCard value={stats.occupied} label="Occupied" subLabel="Students studying"
              color="#B23A48" bg="rgba(178,58,72,0.08)" border="rgba(178,58,72,0.2)" delay={0.3} />
            <BigStatCard value={stats.away} label="Away" subLabel="On break timer"
              color="#D4960A" bg="rgba(212,150,10,0.08)" border="rgba(212,150,10,0.25)" delay={0.4} />
            <BigStatCard value={stats.abandoned} label="Abandoned" subLabel="Need reset"
              color="#757575" bg="rgba(158,158,158,0.08)" border="rgba(158,158,158,0.2)" delay={0.5} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left */}
          <div className="flex flex-col gap-4">
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <OccupancyBar stats={stats} />
              </motion.div>
            )}

            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <PeakChart peakHours={stats.peakHours} />
              </motion.div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4">
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <HeatmapGrid zones={stats.zoneBreakdown} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="bg-card border border-border rounded-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
                  Event Feed
                </span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#556B2F" }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </div>
              <div className="flex flex-col divide-y divide-border" data-testid="admin-event-feed">
                {activity.slice(0, 6).map((evt) => (
                  <div key={evt.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[evt.type] ?? "#9E9E9E" }} />
                      <span className="text-[10px] font-bold text-foreground">
                        Seat {evt.seatNumber} — {evt.event}
                      </span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold">{evt.timestamp}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Abandoned seats */}
        {abandonedSeats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-sm p-6 border"
            style={{ background: "rgba(178,58,72,0.06)", borderColor: "rgba(178,58,72,0.25)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase" style={{ color: "#B23A48" }}>
                Abandoned Desks — Needs Attention
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {abandonedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="bg-card border border-border rounded-sm px-4 py-3 flex flex-col items-center"
                  data-testid={`abandoned-seat-${seat.id}`}
                >
                  <span
                    className="font-black text-foreground leading-none"
                    style={{ fontSize: "1.6rem", letterSpacing: "-0.04em" }}
                  >
                    {seat.number}
                  </span>
                  <span className="text-[8px] font-bold tracking-[0.12em] uppercase text-muted-foreground mt-0.5">
                    Zone {seat.zone}
                  </span>
                  <button
                    onClick={() => releaseSeat.mutate({ id: seat.id })}
                    disabled={releaseSeat.isPending}
                    className="mt-2 text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-1 rounded-sm transition-all"
                    style={{ background: "rgba(178,58,72,0.12)", color: "#B23A48" }}
                    data-testid={`button-release-${seat.id}`}
                  >
                    Release
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
