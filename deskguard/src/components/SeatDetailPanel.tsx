import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, VolumeX, Volume1, Volume2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCheckIn,
  useMarkAway,
  useCheckOut,
  useReportNoise,
  getListSeatsQueryKey,
  getGetStatsQueryKey,
  getListActivityQueryKey,
  getGetNoiseHeatmapQueryKey,
} from "@workspace/api-client-react";
import type { Seat, SeatStatus } from "./SeatCard";

const statusConfig = {
  available: { label: "Available", color: "#556B2F", bg: "rgba(85,107,47,0.1)" },
  occupied: { label: "Occupied", color: "#B23A48", bg: "rgba(178,58,72,0.1)" },
  away: { label: "Away", color: "#D4960A", bg: "rgba(212,150,10,0.1)" },
  abandoned: { label: "Abandoned", color: "#9E9E9E", bg: "rgba(158,158,158,0.1)" },
};

function AwayTimer({ endsAt }: { endsAt?: string | null }) {
  const [remaining, setRemaining] = useState("--:--");

  useEffect(() => {
    if (!endsAt) return;
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining("00:00"); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return (
    <span
      className="font-black leading-none tabular-nums"
      style={{ fontSize: "3.5rem", letterSpacing: "-0.04em", color: "#D4960A" }}
    >
      {remaining}
    </span>
  );
}

function DeskIllustration({ status }: { status: SeatStatus }) {
  const colors = {
    available: { desk: "#8D6E63", glow: "rgba(85,107,47,0.15)", top: "#A1887F" },
    occupied: { desk: "#5D4037", glow: "rgba(178,58,72,0.15)", top: "#6D4C41" },
    away: { desk: "#7B5E4E", glow: "rgba(244,180,0,0.2)", top: "#8D6E63" },
    abandoned: { desk: "#757575", glow: "rgba(150,150,150,0.1)", top: "#9E9E9E" },
  };
  const c = colors[status];

  return (
    <div className="w-full flex justify-center py-4">
      <svg viewBox="0 0 300 180" width="260" height="156" fill="none">
        <motion.ellipse cx="150" cy="130" rx="100" ry="30" fill={c.glow}
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.rect x="30" y="85" width="240" height="14" rx="4" fill={c.desk}
          animate={{ y: [85, 83, 85] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        <rect x="34" y="99" width="232" height="8" rx="2" fill={c.top} opacity={0.6} />
        <rect x="44" y="107" width="10" height="50" rx="3" fill={c.desk} />
        <rect x="246" y="107" width="10" height="50" rx="3" fill={c.desk} />

        <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <rect x="100" y="50" width="100" height="37" rx="3" fill="#37474F" />
          <rect x="103" y="53" width="94" height="31" rx="2" fill="#263238" />
          {status !== "abandoned" && (
            <motion.rect x="103" y="53" width="94" height="31" rx="2"
              fill="rgba(100,180,255,0.1)" animate={{ opacity: [0.05, 0.2, 0.05] }}
              transition={{ duration: 2, repeat: Infinity }} />
          )}
          {status !== "abandoned" && [0, 1, 2].map((i) => (
            <rect key={i} x="112" y={60 + i * 7} width={50 + i * 10} height="2" rx="1" fill="rgba(100,200,255,0.3)" />
          ))}
          <rect x="140" y="87" width="20" height="4" rx="1" fill="#455A64" />
        </motion.g>

        {status === "available" && (
          <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
            <rect x="60" y="68" width="28" height="28" rx="2" fill="white" stroke="#4E342E" strokeWidth="1.5" />
            {[0, 1, 2].map((r) => [0, 1, 2].map((col) => (
              <rect key={`${r}-${col}`} x={63 + r * 8} y={71 + col * 8} width={5} height={5} rx="0.5"
                fill={(r + col) % 2 === 0 ? "#4E342E" : "transparent"} />
            )))}
          </motion.g>
        )}

        {status === "occupied" && (
          <motion.g animate={{ y: [0, -1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <rect x="220" y="66" width="34" height="22" rx="4" fill="#6D4C41" />
            <path d="M228 66 Q237 59 244 66" stroke="#5D4037" strokeWidth="2" fill="none" />
          </motion.g>
        )}

        {status === "away" && (
          <motion.g style={{ originX: "230px", originY: "75px" }}
            animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
            <circle cx="230" cy="75" r="16" fill="none" stroke="#F4B400" strokeWidth="2" />
            <line x1="230" y1="75" x2="230" y2="63" stroke="#F4B400" strokeWidth="2" strokeLinecap="round" />
            <line x1="230" y1="75" x2="238" y2="75" stroke="#F4B400" strokeWidth="2" strokeLinecap="round" />
          </motion.g>
        )}
      </svg>
    </div>
  );
}

interface SeatDetailPanelProps {
  seat: Seat | null;
  onClose: () => void;
}

export default function SeatDetailPanel({ seat, onClose }: SeatDetailPanelProps) {
  const queryClient = useQueryClient();
  const [noiseFeedback, setNoiseFeedback] = useState<string | null>(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListSeatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListActivityQueryKey() });
  };

  const checkIn = useCheckIn({ mutation: { onSuccess: invalidateAll } });
  const markAway = useMarkAway({ mutation: { onSuccess: invalidateAll } });
  const checkOut = useCheckOut({ mutation: { onSuccess: invalidateAll } });
  const reportNoise = useReportNoise({
    mutation: {
      onSuccess: (_data, vars) => {
        setNoiseFeedback(`Reported as ${(vars.data as { level: string }).level}`);
        queryClient.invalidateQueries({ queryKey: getGetNoiseHeatmapQueryKey() });
        setTimeout(() => setNoiseFeedback(null), 2500);
      },
    },
  });

  const formatTime = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDuration = (iso?: string | null) => {
    if (!iso) return "—";
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <AnimatePresence>
      {seat && (
        <motion.div
          key="panel"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 bg-card border-l border-border overflow-y-auto z-50"
          style={{
            width: "min(420px, 100vw)",
            boxShadow: "-20px 0 60px rgba(44,26,23,0.12)",
          }}
          data-testid="seat-detail-panel"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card z-10 border-b border-border px-6 py-4 flex items-center justify-between">
            <span className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
              Seat Details
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-sm hover:bg-muted transition-colors"
              data-testid="button-close-panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 pb-10 flex flex-col gap-0">
            {/* Seat number */}
            <div className="py-6 border-b border-border">
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-1">Seat</p>
              <span
                className="font-black text-foreground leading-none block"
                style={{ fontSize: "6rem", letterSpacing: "-0.05em" }}
                data-testid="text-seat-number"
              >
                {seat.number}
              </span>
              <div className="flex items-center gap-3 mt-3">
                <span
                  className="px-3 py-1 text-[10px] font-extrabold tracking-[0.15em] uppercase rounded-sm border"
                  style={{
                    background: statusConfig[seat.status].bg,
                    color: statusConfig[seat.status].color,
                    borderColor: statusConfig[seat.status].color + "40",
                  }}
                >
                  {statusConfig[seat.status].label}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Zone {seat.zone} — Row {seat.row}
                </span>
              </div>
            </div>

            {/* Illustration */}
            <DeskIllustration status={seat.status} />

            {/* Away timer */}
            {seat.status === "away" && (
              <div
                className="py-5 px-4 rounded-sm border mb-4"
                style={{ background: "#FEF8E7", borderColor: "rgba(244,180,0,0.3)" }}
              >
                <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase mb-2" style={{ color: "#D4960A" }}>
                  Away Time Remaining
                </p>
                <AwayTimer endsAt={seat.awayEndsAt} />
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Auto-expires at {formatTime(seat.awayEndsAt)}
                </p>
              </div>
            )}

            {/* Info rows */}
            <div className="flex flex-col divide-y divide-border">
              {[
                { label: "Last Check-in", value: formatTime(seat.checkedInAt) },
                { label: "Time at Desk", value: getDuration(seat.checkedInAt) },
                { label: "Last Activity", value: formatTime(seat.checkedInAt) },
                { label: "Location", value: `Zone ${seat.zone}, Row ${seat.row}` },
                ...(seat.studentName ? [{ label: "Student", value: seat.studentName }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide">{row.label}</span>
                  <span className="text-xs font-bold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Noise reporting */}
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Report Noise Level
              </p>
              {noiseFeedback ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-bold text-accent text-center py-2"
                >
                  ✓ {noiseFeedback}
                </motion.p>
              ) : (
                <div className="flex gap-2">
                  {[
                    { level: "quiet", icon: <VolumeX size={12} />, label: "Quiet", color: "#556B2F", bg: "rgba(85,107,47,0.08)" },
                    { level: "moderate", icon: <Volume1 size={12} />, label: "Moderate", color: "#D4960A", bg: "rgba(212,150,10,0.08)" },
                    { level: "noisy", icon: <Volume2 size={12} />, label: "Noisy", color: "#B23A48", bg: "rgba(178,58,72,0.08)" },
                  ].map((n) => (
                    <button
                      key={n.level}
                      onClick={() => seat && reportNoise.mutate({ id: seat.id, data: { level: n.level as "quiet" | "moderate" | "noisy" } })}
                      disabled={reportNoise.isPending}
                      className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-sm border transition-all hover:opacity-80 disabled:opacity-40"
                      style={{ background: n.bg, borderColor: n.color + "40", color: n.color }}
                    >
                      {n.icon}
                      <span className="text-[8px] font-extrabold tracking-[0.1em] uppercase">{n.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-5">
              {seat.status === "available" && (
                <button
                  onClick={() => checkIn.mutate({ id: seat.id })}
                  disabled={checkIn.isPending}
                  data-testid="button-checkin"
                  className="w-full py-4 text-xs font-extrabold tracking-[0.1em] uppercase rounded-sm transition-all hover:-translate-y-px disabled:opacity-50"
                  style={{
                    background: "#556B2F",
                    color: "white",
                    boxShadow: checkIn.isPending ? "none" : "0 8px 24px rgba(85,107,47,0.3)",
                  }}
                >
                  {checkIn.isPending ? "Checking in..." : "Check In Here"}
                </button>
              )}

              {seat.status === "occupied" && (
                <>
                  <button
                    onClick={() => markAway.mutate({ id: seat.id })}
                    disabled={markAway.isPending}
                    data-testid="button-away"
                    className="w-full py-4 text-xs font-extrabold tracking-[0.1em] uppercase rounded-sm transition-all hover:-translate-y-px disabled:opacity-50"
                    style={{ background: "#F4B400", color: "#2C1A17" }}
                  >
                    {markAway.isPending ? "..." : "Go Away (20 min)"}
                  </button>
                  <button
                    onClick={() => checkOut.mutate({ id: seat.id })}
                    disabled={checkOut.isPending}
                    data-testid="button-checkout"
                    className="w-full py-4 text-xs font-extrabold tracking-[0.1em] uppercase rounded-sm border transition-all hover:bg-destructive/5 disabled:opacity-50"
                    style={{ borderColor: "#B23A48", color: "#B23A48" }}
                  >
                    {checkOut.isPending ? "..." : "Check Out"}
                  </button>
                </>
              )}

              {seat.status === "away" && (
                <button
                  onClick={() => checkIn.mutate({ id: seat.id })}
                  disabled={checkIn.isPending}
                  data-testid="button-back"
                  className="w-full py-4 text-xs font-extrabold tracking-[0.1em] uppercase rounded-sm transition-all hover:-translate-y-px disabled:opacity-50"
                  style={{ background: "#556B2F", color: "white" }}
                >
                  {checkIn.isPending ? "..." : "I'm Back"}
                </button>
              )}

              {seat.status === "abandoned" && (
                <div
                  className="px-4 py-3 rounded-sm border text-center"
                  style={{ background: "#FBF0F1", borderColor: "rgba(178,58,72,0.2)" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "#B23A48" }}>
                    Desk auto-released. A librarian has been notified.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
