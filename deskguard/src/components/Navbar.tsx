import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { LogOut, Map, LayoutDashboard, User, Trophy, BarChart2, Package } from "lucide-react";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
    },
  });

  const navItems = [
    { href: "/library", label: "Library", icon: Map },
    { href: "/forecast", label: "Forecast", icon: BarChart2 },
    { href: "/achievements", label: "Achievements", icon: Trophy },
    { href: "/lost-found", label: "Lost & Found", icon: Package },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: LayoutDashboard }] : []),
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border"
      style={{ borderBottomWidth: "1px" }}
      data-testid="navbar"
    >
      <div className="px-4 md:px-8 lg:px-12 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/library"
          className="flex items-center gap-2 group"
          data-testid="nav-brand"
        >
          <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
              <div className="bg-background rounded-sm" />
              <div className="bg-background rounded-sm" />
              <div className="bg-background rounded-sm" />
              <div className="bg-background/50 rounded-sm" />
            </div>
          </div>
          <span
            className="text-xs font-black tracking-[0.18em] uppercase text-foreground"
            style={{ letterSpacing: "0.18em" }}
          >
            DeskGuard
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase transition-all rounded-sm whitespace-nowrap ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, "-").replace("&", "and")}`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => logout.mutate()}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-sm"
            data-testid="button-logout"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Out</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
