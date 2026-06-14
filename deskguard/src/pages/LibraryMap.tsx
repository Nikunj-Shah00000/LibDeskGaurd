import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListSeats,
  useGetStats,
  useListActivity,
  useGetRecommendedSeat,
  getListSeatsQueryKey,
  getGetStatsQueryKey,
  getListActivityQueryKey,
  getGetRecommendedSeatQueryKey,
} from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import SeatCard, { type Seat } from "@/components/SeatCard";
import SeatDetailPanel from "@/components/SeatDetailPanel";
import { Sparkles, VolumeX, Zap, Users, X, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  available: "#556B2F",
  occupied: "#B23A48",
  away: "#D4960A",
  abandoned: "#9E9E9E",
};

function ZoneLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {[
        { color: "#556B2F", label: "Available" },
        { color: "#B23A48", label: "Occupied" },
        { color: "#D4960A", label: "Away" },
        { color: "#9E9E9E", label: "Abandoned" },
      ].map((l) => (
        <div key={l.label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
          <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

interface RecommendPrefs {
  quietZone: boolean;
  needsPower: boolean;
  groupSize: number;
}

function RecommendPanel({
  seats,
  onClose,
  onSelect,
}: {
  seats: Seat[];
  onClose: () => void;
  onSelect: (seat: Seat) => void;
}) {
  const [prefs, setPrefs] = useState<RecommendPrefs>({ quietZone: false, needsPower: false, groupSize: 1 });
  const [fired, setFired] = useState(false);

  const { data: result, isFetching, isError, refetch } = useGetRecommendedSeat(
    {
      quietZone: prefs.quietZone,
      needsPower: prefs.needsPower,
      groupSize: prefs.groupSize,
    },
    {
      query: {
        queryKey: getGetRecommendedSeatQueryKey({ quietZone: prefs.quietZone, needsPower: prefs.needsPower, groupSize: prefs.groupSize }),
        enabled: fired,
        retry: false,
      },
    }
  );

  const handleFind = () => {
    if (fired) {
      refetch();
    } else {
      setFired(true);
    }
  };

  const handlePrefsChange = (key: keyof RecommendPrefs, value: boolean | number) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    setFired(false);
  };

  const recommendedSeat = result?.seat
    ? (seats.find((s) => s.id === result.seat.id) ?? (result.seat as unknown as Seat))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full right-0 mt-2 bg-card border border-border rounded-sm shadow-lg z-30"
      style={{ width: "min(360px, calc(100vw - 2rem))", boxShadow: "0 12px 40px rgba(44,26,23,0.14)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles size={13} style={{ color: "#F4B400" }} />
          <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
            Smart Recommendation
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-muted transition-colors"
        >
          <X size={12} className="text-muted-foreground" />
        </button>
      </div>

      {/* Preferences */}
      <div className="px-4 py-3 flex flex-col gap-3 border-b border-border">
        <p className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-muted-foreground">Preferences</p>

        <div className="flex gap-2">
          {/* Quiet zone */}
          <button
            onClick={() => handlePrefsChange("quietZone", !prefs.quietZone)}
            className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-sm border text-[10px] font-bold transition-all ${
              prefs.quietZone
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            <VolumeX size={11} />
            Quiet Zone
          </button>
          {/* Needs power */}
          <button
            onClick={() => handlePrefsChange("needsPower", !prefs.needsPower)}
            className={`flex-1 flex items-center gap-1.5 px-3 py-2 rounded-sm border text-[10px] font-bold transition-all ${
              prefs.needsPower
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            <Zap size={11} />
            Power Outlet
          </button>
        </div>

        {/* Group size */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users size={11} />
            <span className="text-[10px] font-bold">Group</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => handlePrefsChange("groupSize", n)}
                className={`w-8 h-8 rounded-sm border text-xs font-black transition-all ${
                  prefs.groupSize === n
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="px-4 py-3">
        {!fired && !result && (
          <p className="text-[10px] text-muted-foreground text-center py-2">
            Set your preferences and find the best seat.
          </p>
        )}

        {isFetching && (
          <div className="flex items-center justify-center gap-2 py-3">
            <motion.div
              className="w-4 h-4 rounded-full border-2 border-border border-t-foreground"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-[10px] text-muted-foreground font-medium">Scanning seats…</span>
          </div>
        )}

        {!isFetching && isError && (
          <div className="py-3 text-center">
            <p className="text-xs font-bold" style={{ color: "#B23A48" }}>No seats match your preferences</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Try adjusting your filters</p>
          </div>
        )}

        {!isFetching && result && recommendedSeat && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Score bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-muted-foreground">Best Match</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-1.5 rounded-full"
                      style={{ background: i < Math.round(result.score / 20) ? "#F4B400" : "#E8DFD1" }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-muted-foreground">{result.score}pt</span>
              </div>
            </div>

            {/* Seat info */}
            <div
              className="rounded-sm p-3 border mb-2"
              style={{ background: "rgba(244,180,0,0.06)", borderColor: "rgba(244,180,0,0.4)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="font-black text-foreground leading-none block"
                    style={{ fontSize: "2rem", letterSpacing: "-0.04em" }}
                  >
                    {result.seat.number}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Zone {result.seat.zone} — Row {result.seat.row}
                  </span>
                </div>
                <div
                  className="px-2 py-1 rounded-sm text-[9px] font-extrabold tracking-[0.1em] uppercase"
                  style={{ background: "rgba(85,107,47,0.12)", color: "#556B2F" }}
                >
                  {result.seat.status}
                </div>
              </div>

              {/* Reasons */}
              <div className="flex flex-col gap-0.5 mt-2">
                {result.reasons.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#F4B400" }} />
                    <span className="text-[9px] text-muted-foreground font-medium">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Go to seat */}
            <button
              onClick={() => {
                onSelect(recommendedSeat);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm text-[10px] font-extrabold tracking-[0.1em] uppercase transition-all hover:opacity-90"
              style={{ background: "#4E342E", color: "#FAF4EC" }}
            >
              View Seat Details
              <ChevronRight size={11} />
            </button>
          </motion.div>
        )}

        <button
          onClick={handleFind}
          disabled={isFetching}
          className="w-full mt-2 py-2.5 rounded-sm text-[10px] font-extrabold tracking-[0.1em] uppercase border border-border text-muted-foreground hover:bg-muted transition-all disabled:opacity-40"
        >
          {isFetching ? "Searching…" : result ? "Search Again" : "Find My Seat"}
        </button>
      </div>
    </motion.div>
  );
}

export default function LibraryMap() {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [showRecommend, setShowRecommend] = useState(false);
  const [highlightedSeatId, setHighlightedSeatId] = useState<number | null>(null);
  const recommendBtnRef = useRef<HTMLDivElement>(null);

  const { data: seats = [], isLoading: seatsLoading } = useListSeats({
    query: { queryKey: getListSeatsQueryKey(), refetchInterval: 30000 },
  });

  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey(), refetchInterval: 30000 } });
  const { data: activity = [] } = useListActivity({ query: { queryKey: getListActivityQueryKey(), refetchInterval: 15000 } });

  const zones = ["A", "B", "C", "D"];

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleRecommendSelect = (seat: Seat) => {
    setHighlightedSeatId(seat.id);
    setSelectedSeat(seat);
    setTimeout(() => setHighlightedSeatId(null), 8000);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-library">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-12 pt-20 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-muted-foreground mb-2">
            Library Seat Map
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="flex items-end gap-6">
              <h1
                className="font-black uppercase leading-none text-foreground"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em" }}
              >
                Study
              </h1>
              <h1
                className="font-black uppercase leading-none"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em", color: "#556B2F" }}
              >
                Freely.
              </h1>
            </div>

            {/* Find Me a Seat button */}
            <div className="relative" ref={recommendBtnRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRecommend((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-extrabold tracking-[0.1em] uppercase transition-all"
                style={{
                  background: showRecommend ? "#4E342E" : "#F4B400",
                  color: showRecommend ? "#FAF4EC" : "#2C1A17",
                  boxShadow: showRecommend ? "none" : "0 4px 16px rgba(244,180,0,0.35)",
                }}
                data-testid="button-find-seat"
              >
                <Sparkles size={13} />
                Find Me a Seat
              </motion.button>

              <AnimatePresence>
                {showRecommend && (
                  <RecommendPanel
                    seats={seats as Seat[]}
                    onClose={() => setShowRecommend(false)}
                    onSelect={handleRecommendSelect}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          >
            {[
              { value: stats.available, label: "Available", color: "#556B2F", bg: "rgba(85,107,47,0.08)" },
              { value: stats.occupied, label: "Occupied", color: "#B23A48", bg: "rgba(178,58,72,0.08)" },
              { value: stats.away, label: "Away", color: "#D4960A", bg: "rgba(212,150,10,0.08)" },
              { value: stats.abandoned, label: "Abandoned", color: "#9E9E9E", bg: "rgba(158,158,158,0.08)" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="rounded-sm p-4 border"
                style={{ background: s.bg, borderColor: s.color + "40" }}
                data-testid={`stat-${s.label.toLowerCase()}`}
              >
                <span
                  className="font-black leading-none block"
                  style={{ fontSize: "2.5rem", letterSpacing: "-0.04em", color: s.color }}
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

        {/* Highlighted seat banner */}
        <AnimatePresence>
          {highlightedSeatId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-sm border"
                style={{ background: "rgba(244,180,0,0.08)", borderColor: "rgba(244,180,0,0.4)" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Sparkles size={14} style={{ color: "#F4B400" }} />
                </motion.div>
                <p className="text-xs font-bold text-foreground">
                  Recommended seat highlighted below —{" "}
                  <span style={{ color: "#D4960A" }}>
                    look for the gold pulse on seat {seats.find((s) => s.id === highlightedSeatId)?.number}
                  </span>
                </p>
                <button
                  onClick={() => setHighlightedSeatId(null)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Seat grid */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <ZoneLegend />
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-muted-foreground">
                {stats?.occupancyRate ?? 0}% Occupied
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {zones.map((zone) => {
                const zoneSeats = seats.filter((s) => s.zone === zone);
                return (
                  <motion.div
                    key={zone}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: zones.indexOf(zone) * 0.1 }}
                    className="bg-card border border-border rounded-sm p-4"
                    data-testid={`zone-${zone}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
                        Zone {zone}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground">
                        {zoneSeats.filter((s) => s.status === "available").length} free
                      </span>
                    </div>

                    {seatsLoading ? (
                      <div className="grid grid-cols-5 gap-1.5">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className="aspect-square bg-muted rounded-sm animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-1.5">
                        {zoneSeats.map((seat, i) => (
                          <SeatCard
                            key={seat.id}
                            seat={seat as Seat}
                            onClick={handleSeatClick}
                            index={i}
                            highlighted={seat.id === highlightedSeatId}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-sm p-5 sticky top-20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
                  Live Activity
                </span>
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#556B2F" }}
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </div>

              <div className="flex flex-col divide-y divide-border" data-testid="activity-feed">
                {activity.slice(0, 8).map((evt, i) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="py-3 flex items-start justify-between gap-2"
                    data-testid={`activity-event-${evt.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: STATUS_COLORS[evt.type] ?? "#9E9E9E" }}
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground leading-tight">
                          Seat {evt.seatNumber} — {evt.event}
                        </p>
                        {evt.student && (
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{evt.student}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold flex-shrink-0">{evt.timestamp}</span>
                  </motion.div>
                ))}

                {activity.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground font-medium">No recent activity</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <SeatDetailPanel seat={selectedSeat} onClose={() => setSelectedSeat(null)} />

      {/* Overlay */}
      {selectedSeat && (
        <div
          className="fixed inset-0 bg-foreground/10 z-40 backdrop-blur-sm"
          onClick={() => setSelectedSeat(null)}
        />
      )}

      {/* Close recommend panel on outside click */}
      {showRecommend && (
        <div className="fixed inset-0 z-20" onClick={() => setShowRecommend(false)} />
      )}
    </div>
  );
}
