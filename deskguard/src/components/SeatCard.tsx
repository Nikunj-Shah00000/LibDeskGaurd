import { motion } from "framer-motion";

type SeatStatus = "available" | "occupied" | "away" | "abandoned";

interface Seat {
  id: number;
  number: string;
  zone: string;
  row: number;
  status: SeatStatus;
  studentName?: string | null;
  checkedInAt?: string | null;
  awayEndsAt?: string | null;
}

const statusConfig = {
  available: { color: "#556B2F", bg: "rgba(85,107,47,0.08)", border: "rgba(85,107,47,0.3)", dot: "#556B2F" },
  occupied: { color: "#B23A48", bg: "rgba(178,58,72,0.08)", border: "rgba(178,58,72,0.3)", dot: "#B23A48" },
  away: { color: "#D4960A", bg: "rgba(212,150,10,0.08)", border: "rgba(212,150,10,0.3)", dot: "#D4960A" },
  abandoned: { color: "#9E9E9E", bg: "rgba(158,158,158,0.08)", border: "rgba(158,158,158,0.3)", dot: "#9E9E9E" },
};

interface SeatCardProps {
  seat: Seat;
  onClick: (seat: Seat) => void;
  index: number;
  highlighted?: boolean;
}

export default function SeatCard({ seat, onClick, index, highlighted = false }: SeatCardProps) {
  const cfg = statusConfig[seat.status];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={highlighted ? { opacity: 1, scale: [1, 1.08, 1] } : { opacity: 1, scale: 1 }}
      transition={highlighted ? { delay: index * 0.012, duration: 0.6, repeat: Infinity, repeatDelay: 1.2 } : { delay: index * 0.012, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(seat)}
      data-testid={`seat-card-${seat.id}`}
      className="relative flex flex-col items-center justify-center aspect-square rounded-sm transition-all cursor-pointer focus:outline-none"
      style={{
        background: highlighted ? "rgba(244,180,0,0.15)" : cfg.bg,
        border: highlighted ? "2px solid #F4B400" : `1.5px solid ${cfg.border}`,
        minHeight: "52px",
        boxShadow: highlighted ? "0 0 12px rgba(244,180,0,0.4), 0 0 24px rgba(244,180,0,0.2)" : undefined,
      }}
    >
      {highlighted && (
        <motion.div
          className="absolute inset-0 rounded-sm"
          style={{ border: "2px solid #F4B400" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Status dot */}
      <motion.div
        className="absolute top-1.5 right-1.5 rounded-full"
        style={{ width: 6, height: 6, background: highlighted ? "#F4B400" : cfg.dot }}
        animate={
          highlighted
            ? { scale: [1, 1.4, 1] }
            : seat.status === "away"
            ? { opacity: [1, 0.3, 1] }
            : seat.status === "abandoned"
            ? { opacity: [1, 0.5, 1] }
            : {}
        }
        transition={
          highlighted
            ? { duration: 1, repeat: Infinity }
            : seat.status === "away" || seat.status === "abandoned"
            ? { duration: 1.5, repeat: Infinity }
            : {}
        }
      />

      {/* Seat number */}
      <span
        className="font-black leading-none"
        style={{ fontSize: "1.1rem", letterSpacing: "-0.03em", color: highlighted ? "#4E342E" : "inherit" }}
      >
        {seat.number}
      </span>

      {/* Status micro-label */}
      <span
        className="text-[7px] font-bold tracking-[0.08em] uppercase mt-0.5"
        style={{ color: highlighted ? "#D4960A" : cfg.color }}
      >
        {highlighted ? "Pick!" : seat.status === "available" ? "Free" : seat.status === "occupied" ? "In use" : seat.status === "away" ? "Away" : "Gone"}
      </span>
    </motion.button>
  );
}

export type { Seat, SeatStatus };
