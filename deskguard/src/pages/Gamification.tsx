import { motion } from "framer-motion";
import { useGetGamificationProfile, useGetLeaderboard } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { Flame, Trophy, Star, Zap, Moon, Sun, Clock, Map } from "lucide-react";

const BADGE_ICONS: Record<string, React.ReactNode> = {
  first_session: <Star size={18} />,
  early_bird: <Sun size={18} />,
  night_owl: <Moon size={18} />,
  streak_3: <Flame size={18} />,
  streak_7: <Zap size={18} />,
  hours_10: <Clock size={18} />,
  hours_50: <Trophy size={18} />,
  zone_explorer: <Map size={18} />,
};

const RANK_COLORS = ["#F4B400", "#9E9E9E", "#CD7F32", "#556B2F", "#4E342E"];

function StreakFlame({ streak }: { streak: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [-3, 3, -3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <Flame
          size={56}
          className="fill-current"
          style={{ color: streak > 0 ? "#F4B400" : "#E8DFD1" }}
        />
        {streak > 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span
              className="font-black text-background leading-none"
              style={{ fontSize: streak > 9 ? "14px" : "16px", marginTop: "4px" }}
            >
              {streak}
            </span>
          </motion.div>
        )}
      </motion.div>
      <span className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-muted-foreground">
        {streak === 1 ? "1 Day Streak" : streak > 0 ? `${streak} Day Streak` : "No Streak"}
      </span>
    </div>
  );
}

export default function Gamification() {
  const { data: profile, isLoading: profileLoading } = useGetGamificationProfile();
  const { data: leaderboard = [], isLoading: boardLoading } = useGetLeaderboard();

  return (
    <div className="min-h-screen bg-background" data-testid="page-gamification">
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
            Study Achievements
          </p>
          <div className="flex items-end gap-4 flex-wrap">
            <h1
              className="font-black uppercase leading-none text-foreground"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em" }}
            >
              Level
            </h1>
            <h1
              className="font-black uppercase leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.04em", color: "#F4B400" }}
            >
              Up.
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column — streak + stats + badges */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Streak + stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-sm p-6"
            >
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-6">
                Your Progress
              </p>
              {profileLoading ? (
                <div className="flex gap-8">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 w-24 bg-muted rounded-sm animate-pulse" />)}
                </div>
              ) : profile ? (
                <div className="flex items-center gap-8 flex-wrap">
                  <StreakFlame streak={profile.streak} />
                  <div className="flex items-center gap-6 flex-wrap">
                    {[
                      { n: `${Math.round(profile.weeklyMinutes / 60 * 10) / 10}h`, label: "This Week", color: "#556B2F" },
                      { n: `${Math.round(profile.totalMinutes / 60)}h`, label: "Total Time", color: "#4E342E" },
                      { n: String(profile.badges.filter((b) => b.earned).length), label: "Badges", color: "#F4B400" },
                      ...(profile.rank !== null ? [{ n: `#${profile.rank}`, label: "Rank", color: "#B23A48" }] : []),
                    ].map((s, i) => (
                      <div key={s.label} className={`flex flex-col ${i > 0 ? "pl-6 border-l border-border" : ""}`}>
                        <span
                          className="font-black leading-none"
                          style={{ fontSize: "2.5rem", letterSpacing: "-0.04em", color: s.color }}
                        >
                          {s.n}
                        </span>
                        <span className="text-[8px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Log in and check in to start earning achievements</p>
              )}
            </motion.div>

            {/* Badges grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-sm p-6"
            >
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Badges
              </p>
              {profileLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-sm animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(profile?.badges ?? []).map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className={`rounded-sm p-4 flex flex-col items-center gap-2 border transition-all ${
                        badge.earned
                          ? "bg-card border-border"
                          : "bg-background border-border/40 opacity-40"
                      }`}
                      style={badge.earned ? { boxShadow: "0 2px 8px rgba(244,180,0,0.15)" } : {}}
                    >
                      <div
                        className="w-10 h-10 rounded-sm flex items-center justify-center"
                        style={{
                          background: badge.earned ? "rgba(244,180,0,0.12)" : "rgba(158,158,158,0.08)",
                          color: badge.earned ? "#F4B400" : "#9E9E9E",
                        }}
                      >
                        {BADGE_ICONS[badge.id] ?? <Star size={18} />}
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-foreground leading-tight">{badge.name}</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                        {badge.earned && badge.earnedAt && (
                          <p className="text-[8px] text-accent mt-1 font-bold">Earned ✓</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-extrabold tracking-[0.2em] uppercase text-muted-foreground">
                Weekly Leaderboard
              </p>
              <Trophy size={14} style={{ color: "#F4B400" }} />
            </div>

            <div className="flex flex-col divide-y divide-border">
              {boardLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="py-3 h-12 bg-muted rounded-sm animate-pulse mb-1" />
                  ))
                : leaderboard.map((entry, i) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      className="py-3 flex items-center gap-3"
                    >
                      <span
                        className="font-black text-sm w-6 text-center flex-shrink-0"
                        style={{ color: RANK_COLORS[i] ?? "#4E342E" }}
                      >
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-foreground truncate">{entry.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Flame size={9} style={{ color: "#F4B400" }} />
                          <span className="text-[9px] text-muted-foreground font-semibold">
                            {entry.streak}d streak
                          </span>
                          <span className="text-[9px] text-muted-foreground">·</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">
                            {entry.badges} badges
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-black text-sm" style={{ color: "#556B2F" }}>
                          {Math.round(entry.weeklyMinutes / 60 * 10) / 10}h
                        </span>
                        <p className="text-[8px] text-muted-foreground font-medium">this week</p>
                      </div>
                    </motion.div>
                  ))}
            </div>

            {leaderboard.length === 0 && !boardLoading && (
              <div className="py-8 text-center">
                <p className="text-xs text-muted-foreground">No study sessions this week yet</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
