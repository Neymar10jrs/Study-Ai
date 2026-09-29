import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { StudentProfile } from "@/types";
import {
  Sparkles,
  Camera,
  Search,
  Bell,
  User,
  Menu,
  X,
  BookOpen,
  Award,
  BarChart3,
  BrainCircuit,
  Home,
  LogOut,
  ChevronDown
} from "lucide-react";

export type NavTab = "home" | "tutor" | "solver" | "subjects" | "tools" | "practice" | "dashboard";

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onAskAI: () => void;
  profile: StudentProfile;
}

export function Navbar({
  currentTab,
  onTabChange,
  onOpenSearch,
  onOpenAuth,
  onAskAI,
  profile,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
    { id: "tutor", label: "AI Tutor", icon: <BrainCircuit className="h-4 w-4" /> },
    { id: "solver", label: "Solve Question", icon: <Camera className="h-4 w-4" /> },
    { id: "subjects", label: "Subjects", icon: <BookOpen className="h-4 w-4" /> },
    { id: "tools", label: "Study Tools", icon: <Sparkles className="h-4 w-4" /> },
    { id: "practice", label: "Practice", icon: <Award className="h-4 w-4" /> },
    { id: "dashboard", label: "My Progress", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-[#090a0f]/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange("home")}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 p-0.5 shadow-glow-sm group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-orange-300 transition-colors">
                Study<span className="text-orange-400">AI</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-300 border border-orange-500/20">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium tracking-wide hidden lg:inline">
              Learn Smarter. Understand Everything.
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs lg:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/40 shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Search, Notifications, Profile & Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors hidden sm:flex items-center gap-2"
            title="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
            <kbd className="hidden lg:inline-block text-[10px] font-mono text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 relative transition-colors"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 shadow-glow-sm" />
            </button>
            <NotificationsPopover
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              onSelectAction={() => onTabChange("dashboard")}
            />
          </div>

          {/* Student Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {profile.name.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-white max-w-[100px] truncate">
                {profile.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:inline" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl glass-panel border border-white/10 p-2 shadow-2xl z-50 bg-[#0d0f18]/95 backdrop-blur-2xl animate-fadeIn space-y-1">
                <div className="p-2 border-b border-white/10">
                  <p className="text-xs font-bold text-white truncate">{profile.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{profile.email}</p>
                  <Badge variant="glow" className="mt-1 text-[10px]">
                    {profile.gradeLevel}
                  </Badge>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onTabChange("dashboard");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-orange-400" />
                  <span>My Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <span>Switch Account / Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button: "Ask AI" */}
          <Button
            variant="default"
            size="sm"
            onClick={onAskAI}
            className="font-semibold text-xs sm:text-sm px-3 sm:px-4 gap-1.5 shadow-glow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            <span>Ask AI</span>
          </Button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 pt-3 pb-6 space-y-2 animate-fadeIn bg-[#0d0f18]/95 backdrop-blur-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentTab === item.id
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="w-full text-xs justify-start gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Quick Search</span>
            </Button>

            <Button
              variant="gradient"
              size="sm"
              onClick={() => {
                onAskAI();
                setMobileMenuOpen(false);
              }}
              className="w-full font-semibold text-xs"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              <span>Ask AI Tutor</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
