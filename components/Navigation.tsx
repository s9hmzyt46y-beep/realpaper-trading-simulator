"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  TrendingUp,
  History,
  Trophy,
  Award,
  BarChart3,
  Shield,
  LogOut,
  Globe,
} from "lucide-react";
import { useSimulationDate } from "@/store/simulationDate";
import { formatDate } from "@/lib/utils";
import SimulationDatePicker from "./SimulationDatePicker";
import { useEffect, useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, i18n } = useTranslation();
  const { simulationDate, isSimulationMode, resetToNow } = useSimulationDate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/portfolio", label: t("nav.portfolio"), icon: Briefcase },
    { href: "/trade", label: t("nav.trade"), icon: TrendingUp },
    { href: "/history", label: t("nav.history"), icon: History },
    { href: "/tournament", label: t("nav.tournament"), icon: Trophy },
    { href: "/leaderboard", label: t("nav.leaderboard"), icon: BarChart3 },
    { href: "/achievements", label: t("nav.achievements"), icon: Award },
    { href: "/risk-profile", label: t("nav.riskProfile"), icon: Shield },
  ];

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "lt" : "en";
    i18n.changeLanguage(newLang);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              RealPaper Trading
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
              <Button>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!session) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              RealPaper Trading
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={toggleLanguage}>
                <Globe className="h-5 w-5" />
              </Button>
              <Button onClick={() => signIn("google")}>
                {t("auth.signIn")}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-2xl font-bold">
            RealPaper Trading
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.email}
            </span>
            <SimulationDatePicker />
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Globe className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isSimulationMode && simulationDate && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold">{t("simulation.active")}:</span>{" "}
              {formatDate(simulationDate instanceof Date ? simulationDate : new Date(simulationDate))}
            </div>
            <Button size="sm" variant="outline" onClick={resetToNow}>
              {t("simulation.backToNow")}
            </Button>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

