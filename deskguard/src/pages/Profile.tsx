import { motion } from "framer-motion";
import { useGetProfile, useGetMe } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";

function StudyArtwork() {
  return (
    <div className="flex justify-center py-6">
      <svg viewBox="0 0 320 240" width="260" height="195" fill="none">
        <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M60 80 Q100 70 160 80 L160 180 Q100 185 60 175 Z" fill="#F5EDE0" stroke="#C8B9A8" strokeWidth="1.5" />
          <path d="M160 80 Q220 70 260 80 L260 175 Q220 185 160 180 Z" fill="#FAF4EC" stroke="#C8B9A8" strokeWidth="1.5" />
          <line x1="160" y1="78" x2="160" y2="182" stroke="#8D6E63" strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`l-${i}`} x1={75} y1={100 + i * 15} x2={148} y2={102 + i * 15} stroke="rgba(139,115,100,0.3)" strokeWidth="1" />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`r-${i}`} x1={172} y1={100 + i * 15} x2={248} y2={102 + i * 15} stroke="rgba(139,115,100,0.3)" strokeWidth="1" />
          ))}
        </motion.g>

        {[
          { x: 80, y: 55, r: 3, color: "#556B2F" },
          { x: 240, y: 50, r: 2, color: "#F4B400" },
          { x: 160, y: 30, r: 3, color: "#B23A48" },
          { x: 290, y: 120, r: 2, color: "#4E342E" },
          { x: 35, y: 130, r: 3, color: "#556B2F" },
        ].map((s, i) => (
          <motion.circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.color}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        <line x1="270" y1="200" x2="270" y2="140" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
        <line x1="270" y1="140" x2="250" y2="110" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
        <motion.ellipse
          cx="244" cy="108" rx="12" ry="7"
          fill="#F4B400"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile();
  const { data: user } = useGetMe();

  const displayName = user?.name ?? profile?.user?.name ?? "Student";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background" data-testid="page-profile">
      <Navbar />
      <div className="px-4 md:px-8 lg:px-12 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Your Profile
            </p>
            <h1
              className="font-black uppercase leading-none text-foreground"
              style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", letterSpacing: "-0.04em" }}
              data-testid="text-profile-name"
            >
              {firstName}
            </h1>
            <h2
              className="font-black uppercase leading-none"
              style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", letterSpacing: "-0.04em", color: "#556B2F" }}
            >
              Focus.
            </h2>

            <StudyArtwork />

            {/* Stats */}
            {isLoading ? (
              <div className="flex gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-20 bg-muted rounded-sm animate-pulse" />
                ))}
              </div>
            ) : profile ? (
              <div className="flex items-center gap-6">
                {[
                  { n: String(profile.totalSessions), label: "Sessions" },
                  { n: profile.totalHours || "0m", label: "Study Time" },
                  { n: profile.favoriteZone, label: "Fav Zone" },
                ].map((s, i) => (
                  <div key={s.label} className={`flex flex-col ${i > 0 ? "pl-6 border-l border-border" : ""}`}>
                    <span
                      className="font-black text-foreground leading-none"
                      style={{ fontSize: "2.5rem", letterSpacing: "-0.04em" }}
                      data-testid={`stat-${s.label.toLowerCase().replace(" ", "-")}`}
                    >
                      {s.n}
                    </span>
                    <span className="text-[8px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </motion.div>

          {/* Right */}
          <div className="flex flex-col gap-4 mt-0 lg:mt-16">
            {/* Account info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-sm p-5"
            >
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Account
              </p>
              <div className="flex flex-col divide-y divide-border">
                {[
                  { label: "Name", value: user?.name ?? "—" },
                  { label: "Email", value: user?.email ?? "—" },
                  { label: "Role", value: user?.role ?? "student" },
                  { label: "Member Since", value: "Sept 2024" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5">
                    <span className="text-xs font-semibold text-muted-foreground">{row.label}</span>
                    <span
                      className="text-xs font-bold text-foreground capitalize"
                      data-testid={`account-${row.label.toLowerCase()}`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-card border border-border rounded-sm p-5"
            >
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Recent Sessions
              </p>
              <div className="flex flex-col divide-y divide-border" data-testid="recent-sessions">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="py-3 h-12 bg-muted rounded-sm animate-pulse mb-1" />
                  ))
                ) : profile?.recentSessions?.length ? (
                  profile.recentSessions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="py-3 flex items-center justify-between"
                      data-testid={`session-${s.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-sm flex items-center justify-center"
                          style={{ background: "rgba(78,52,46,0.08)" }}
                        >
                          <span className="text-sm font-black text-foreground">{s.seatNumber}</span>
                        </div>
                        <div className="flex flex-col gap-0">
                          <span className="text-xs font-bold text-foreground">Seat {s.seatNumber}</span>
                          <span className="text-[9px] text-muted-foreground font-medium">Zone {s.zone}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0">
                        <span className="text-xs font-bold text-foreground">{s.duration}</span>
                        <span className="text-[9px] text-muted-foreground font-medium">{s.date}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground font-medium">No sessions yet</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Check in to a seat to get started</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
