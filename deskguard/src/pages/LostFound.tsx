import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListLostFound, useReportLostFound, useClaimLostFound, useListSeats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListLostFoundQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Package, CheckCircle, Plus, X } from "lucide-react";

const STATUS_CONFIG = {
  unclaimed: { label: "Unclaimed", color: "#D4960A", bg: "rgba(212,150,10,0.08)" },
  claimed: { label: "Claimed", color: "#556B2F", bg: "rgba(85,107,47,0.08)" },
};

function ReportModal({
  onClose,
  seats,
}: {
  onClose: () => void;
  seats: { id: number; number: string; zone: string }[];
}) {
  const queryClient = useQueryClient();
  const [desc, setDesc] = useState("");
  const [seatId, setSeatId] = useState<number | "">("");

  const report = useReportLostFound({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLostFoundQueryKey() });
        onClose();
      },
    },
  });

  const selectedSeat = seats.find((s) => s.id === seatId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat || !desc.trim()) return;
    report.mutate({
      data: {
        seatId: selectedSeat.id,
        seatNumber: selectedSeat.number,
        zone: selectedSeat.zone,
        description: desc.trim(),
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card border border-border rounded-sm p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
            Report Found Item
          </p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">
              Seat
            </label>
            <select
              value={seatId}
              onChange={(e) => setSeatId(Number(e.target.value))}
              required
              className="w-full bg-background border border-border rounded-sm px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">Select a seat…</option>
              {["A", "B", "C", "D"].map((zone) => (
                <optgroup key={zone} label={`Zone ${zone}`}>
                  {seats.filter((s) => s.zone === zone).map((s) => (
                    <option key={s.id} value={s.id}>Seat {s.number} — Zone {zone}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">
              Item Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              placeholder="e.g. Blue water bottle, AirPods in case, Laptop charger…"
              rows={3}
              className="w-full bg-background border border-border rounded-sm px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold tracking-[0.1em] uppercase border border-border rounded-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={report.isPending || !selectedSeat || !desc.trim()}
              className="flex-1 py-2.5 text-xs font-bold tracking-[0.1em] uppercase bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {report.isPending ? "Reporting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function LostFound() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "unclaimed" | "claimed">("all");

  const { data: items = [], isLoading } = useListLostFound({ query: { queryKey: getListLostFoundQueryKey(), refetchInterval: 30000 } });
  const { data: seats = [] } = useListSeats();
  const claim = useClaimLostFound({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLostFoundQueryKey() }),
    },
  });

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
  const unclaimed = items.filter((i) => i.status === "unclaimed").length;

  return (
    <div className="min-h-screen bg-background" data-testid="page-lost-found">
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
            Lost & Found Assistant
          </p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="flex items-end gap-4">
              <h1
                className="font-black uppercase leading-none text-foreground"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em" }}
              >
                Found
              </h1>
              <h1
                className="font-black uppercase leading-none"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em", color: "#556B2F" }}
              >
                It.
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-xs font-bold tracking-[0.1em] uppercase rounded-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={12} />
              Report Item
            </button>
          </div>
        </motion.div>

        {/* Stats + filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4 mb-6 flex-wrap"
        >
          <div className="flex gap-3">
            {[
              { n: items.length, label: "Total Items", color: "#4E342E" },
              { n: unclaimed, label: "Unclaimed", color: "#D4960A" },
              { n: items.length - unclaimed, label: "Claimed", color: "#556B2F" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col ${i > 0 ? "pl-4 border-l border-border" : ""}`}
              >
                <span
                  className="font-black leading-none"
                  style={{ fontSize: "2rem", letterSpacing: "-0.04em", color: s.color }}
                >
                  {s.n}
                </span>
                <span className="text-[8px] font-bold tracking-[0.12em] uppercase text-muted-foreground mt-0.5">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="ml-auto flex gap-1">
            {(["all", "unclaimed", "claimed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[9px] font-extrabold tracking-[0.1em] uppercase rounded-sm transition-all ${
                  filter === f
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Items grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-sm animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center gap-4 text-center"
          >
            <div
              className="w-16 h-16 rounded-sm flex items-center justify-center"
              style={{ background: "rgba(78,52,46,0.06)" }}
            >
              <Package size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">
              {filter === "all" ? "No items reported yet" : `No ${filter} items`}
            </p>
            {filter === "all" && (
              <p className="text-xs text-muted-foreground max-w-xs">
                If you find a lost item at a desk, report it here so the owner can reclaim it.
              </p>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((item, i) => {
                const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.unclaimed;
                const relTime = (() => {
                  const diff = Date.now() - new Date(item.reportedAt).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 60) return `${mins}m ago`;
                  const hrs = Math.floor(mins / 60);
                  if (hrs < 24) return `${hrs}h ago`;
                  return `${Math.floor(hrs / 24)}d ago`;
                })();

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-sm p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <Package size={14} />
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold tracking-[0.1em] uppercase" style={{ color: cfg.color }}>
                            {cfg.label}
                          </span>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Seat {item.seatNumber} — Zone {item.zone}
                          </p>
                        </div>
                      </div>
                      <span className="text-[8px] text-muted-foreground font-semibold flex-shrink-0">{relTime}</span>
                    </div>

                    <p className="text-xs font-bold text-foreground leading-snug">{item.description}</p>

                    {item.status === "unclaimed" && (
                      <button
                        onClick={() => claim.mutate({ id: item.id })}
                        disabled={claim.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-extrabold tracking-[0.1em] uppercase rounded-sm transition-all hover:opacity-80 self-start"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        <CheckCircle size={11} />
                        Mark as Claimed
                      </button>
                    )}

                    {item.status === "claimed" && item.claimedAt && (
                      <p className="text-[9px] text-muted-foreground font-medium">
                        Claimed {new Date(item.claimedAt).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <ReportModal
            onClose={() => setShowModal(false)}
            seats={seats.map((s) => ({ id: s.id, number: s.number, zone: s.zone }))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
