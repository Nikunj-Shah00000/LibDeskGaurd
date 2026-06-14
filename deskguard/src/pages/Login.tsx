import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ChevronDown, Sparkles, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  { email: "alice@library.edu",    name: "Alice Chen",     role: "student" },
  { email: "ben@library.edu",      name: "Ben Okafor",     role: "student" },
  { email: "clara@library.edu",    name: "Clara Santos",   role: "student" },
  { email: "david@library.edu",    name: "David Kim",      role: "student" },
  { email: "esther@library.edu",   name: "Esther Müller",  role: "student" },
  { email: "frank@library.edu",    name: "Frank Nguyen",   role: "student" },
  { email: "grace@library.edu",    name: "Grace Patel",    role: "student" },
  { email: "hiroshi@library.edu",  name: "Hiroshi Tanaka", role: "student" },
  { email: "admin@library.edu",    name: "Admin User",     role: "admin"   },
];

function StudyRoomIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 420 360" className="w-full max-w-[420px]" fill="none">
        <ellipse cx="210" cy="300" rx="180" ry="40" fill="rgba(78,52,46,0.06)" />

        <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
          <rect x="40" y="160" width="140" height="12" rx="3" fill="#8D6E63" />
          <rect x="44" y="172" width="132" height="6" rx="2" fill="#A1887F" opacity={0.6} />
          <rect x="50" y="178" width="8" height="60" rx="3" fill="#8D6E63" />
          <rect x="164" y="178" width="8" height="60" rx="3" fill="#8D6E63" />
          <rect x="80" y="128" width="80" height="34" rx="3" fill="#37474F" />
          <rect x="83" y="131" width="74" height="27" rx="2" fill="#1C313A" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={90} y={137 + i * 6} width={40 + i * 8} height="2" rx="1" fill="rgba(100,200,255,0.25)" />
          ))}
          <rect x="107" y="162" width="16" height="4" rx="1" fill="#455A64" />
        </motion.g>

        <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>
          <rect x="240" y="140" width="140" height="12" rx="3" fill="#6D4C41" />
          <rect x="244" y="152" width="132" height="6" rx="2" fill="#8D6E63" opacity={0.6} />
          <rect x="250" y="158" width="8" height="70" rx="3" fill="#6D4C41" />
          <rect x="364" y="158" width="8" height="70" rx="3" fill="#6D4C41" />
          <rect x="280" y="108" width="80" height="34" rx="3" fill="#37474F" />
          <rect x="283" y="111" width="74" height="27" rx="2" fill="#1C313A" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={290} y={117 + i * 6} width={35 + i * 8} height="2" rx="1" fill="rgba(100,200,255,0.2)" />
          ))}
          <rect x="307" y="142" width="16" height="4" rx="1" fill="#455A64" />
          <rect x="345" y="120" width="30" height="22" rx="4" fill="#5D4037" />
          <path d="M350 120 Q360 112 370 120" stroke="#4E342E" strokeWidth="2" fill="none" />
        </motion.g>

        <rect x="0" y="60" width="18" height="160" rx="2" fill="#8D6E63" opacity={0.4} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x="2" y={65 + i * 22} width="14" height="18" rx="1"
            fill={["#556B2F","#B23A48","#4E342E","#D4960A","#6D4C41","#556B2F","#B23A48"][i]} opacity={0.7} />
        ))}

        <rect x="390" y="200" width="20" height="30" rx="3" fill="#8D6E63" opacity={0.5} />
        <ellipse cx="400" cy="196" rx="22" ry="18" fill="#556B2F" opacity={0.7} />
        <ellipse cx="388" cy="190" rx="14" ry="12" fill="#4A5F28" opacity={0.6} />
        <ellipse cx="412" cy="192" rx="14" ry="11" fill="#4A5F28" opacity={0.5} />

        {[
          { x: 130, y: 80, color: "#556B2F", delay: 0 },
          { x: 290, y: 60, color: "#B23A48", delay: 0.6 },
          { x: 200, y: 40, color: "#D4960A", delay: 1.2 },
          { x: 350, y: 90, color: "#4E342E", delay: 0.3 },
          { x: 80,  y: 50, color: "#556B2F", delay: 0.9 },
        ].map((p, i) => (
          <motion.circle key={i} cx={p.x} cy={p.y} r={i % 2 === 0 ? 3 : 2} fill={p.color}
            animate={{ opacity: [0, 1, 0], y: [0, -8, 0] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: p.delay }} />
        ))}

        <line x1="390" y1="260" x2="390" y2="200" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
        <line x1="390" y1="200" x2="372" y2="172" stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round" />
        <motion.ellipse cx="366" cy="169" rx="10" ry="6" fill="#F4B400"
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.ellipse cx="320" cy="180" rx="40" ry="12" fill="rgba(244,180,0,0.06)"
          animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      </svg>
    </div>
  );
}

function AccountPicker({ value, onChange }: { value: string; onChange: (email: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-sm border border-border bg-muted/30 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={11} style={{ color: "#F4B400" }} />
          <span>Try a demo account</span>
        </div>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-sm shadow-lg z-20 overflow-hidden"
          >
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  onChange(acc.email);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted transition-colors border-b border-border last:border-0 ${
                  value === acc.email ? "bg-muted" : ""
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{acc.name}</p>
                  <p className="text-[10px] text-muted-foreground">{acc.email}</p>
                </div>
                <span
                  className="text-[8px] font-extrabold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: acc.role === "admin" ? "rgba(178,58,72,0.1)" : "rgba(85,107,47,0.1)",
                    color: acc.role === "admin" ? "#B23A48" : "#556B2F",
                  }}
                >
                  {acc.role}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/library");
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        setError(msg ?? "Sign in failed. Check your credentials.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    loginMutation.mutate({ data: { email: email.trim(), password } });
  };

  const handlePickDemo = (pickedEmail: string) => {
    setEmail(pickedEmail);
    setPassword("demo1234");
    setError("");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden" data-testid="page-login">
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center px-6 md:px-12 lg:px-16 gap-12 lg:gap-0">

        {/* Left: headline + form */}
        <div className="flex-1 flex flex-col justify-center pt-16 lg:pt-0 max-w-md">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <p className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-muted-foreground mb-6">
              Library Seat Management
            </p>
            <h1 className="font-black uppercase leading-none" style={{ letterSpacing: "-0.04em", fontSize: "clamp(2.8rem, 7vw, 5rem)" }}>
              <span className="block text-foreground">Study</span>
              <span className="block text-foreground">Without</span>
              <span className="block" style={{ color: "#B23A48" }}>Hoarding.</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed mt-4 max-w-sm">
              Real-time seat tracking. Anti-hoarding auto-release. Fair access for everyone.
            </p>
          </motion.div>

          {/* Login form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="mt-8 flex flex-col gap-3"
          >
            {/* Demo account picker */}
            <AccountPicker value={email} onChange={handlePickDemo} />

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-muted-foreground">or type manually</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Email address"
                data-testid="input-email"
                className="w-full pl-9 pr-3 py-3 bg-card border border-border rounded-sm text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Password"
                data-testid="input-password"
                className="w-full pl-9 pr-3 py-3 bg-card border border-border rounded-sm text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm"
                  style={{ background: "rgba(178,58,72,0.08)", border: "1px solid rgba(178,58,72,0.3)" }}
                >
                  <AlertCircle size={11} style={{ color: "#B23A48", flexShrink: 0 }} />
                  <span className="text-[10px] font-bold" style={{ color: "#B23A48" }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loginMutation.isPending}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              data-testid="button-sign-in"
              className="w-full py-3.5 text-xs font-extrabold tracking-[0.1em] uppercase rounded-sm transition-all disabled:opacity-50"
              style={{
                background: "#4E342E",
                color: "#FAF4EC",
                boxShadow: "0 6px 24px rgba(44,26,23,0.22)",
              }}
            >
              {loginMutation.isPending ? "Signing in…" : "Sign In"}
            </motion.button>

            {/* Hint */}
            <p className="text-[9px] text-muted-foreground text-center font-medium">
              Demo password for all accounts:{" "}
              <span
                className="font-extrabold cursor-pointer hover:underline"
                style={{ color: "#4E342E" }}
                onClick={() => setPassword("demo1234")}
              >
                demo1234
              </span>
            </p>
          </motion.form>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}
            className="flex items-center gap-6 mt-10"
          >
            {[
              { n: "60",    label: "Total Seats" },
              { n: "20min", label: "Away Limit"  },
              { n: "2hr",   label: "Auto-Expire" },
            ].map((s, i) => (
              <div key={s.n} className={`flex flex-col ${i > 0 ? "pl-6 border-l border-border" : ""}`}>
                <span className="text-2xl font-black text-foreground leading-none" style={{ letterSpacing: "-0.03em" }}>{s.n}</span>
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground mt-0.5">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="flex-1 flex items-center justify-center w-full lg:max-w-lg"
          style={{ minHeight: "360px" }}
        >
          <StudyRoomIllustration />
        </motion.div>
      </div>
    </div>
  );
}
