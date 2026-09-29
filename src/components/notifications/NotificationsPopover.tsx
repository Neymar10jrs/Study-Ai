import React from "react";
import { Bell, Flame, Award, BookOpen, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (text: string) => void;
}

export function NotificationsPopover({ isOpen, onClose, onSelectAction }: NotificationsPopoverProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: "n1",
      icon: <Flame className="h-4 w-4 text-amber-400" />,
      title: "7-Day Streak Achieved!",
      desc: "You maintained your study streak for a full week. Keep going!",
      time: "2h ago",
    },
    {
      id: "n2",
      icon: <Award className="h-4 w-4 text-emerald-400" />,
      title: "Accuracy Milestone",
      desc: "Your Mathematics accuracy crossed 94% on Calculus problems.",
      time: "1d ago",
    },
    {
      id: "n3",
      icon: <BookOpen className="h-4 w-4 text-orange-400" />,
      title: "New Practice Set Ready",
      desc: "5 recommended questions in Electrostatics are waiting for you.",
      time: "2d ago",
    },
  ];

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl glass-panel border border-white/10 p-4 shadow-2xl z-50 animate-fadeIn space-y-3 bg-[#0d0f18]/95 backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-bold text-white">Notifications</span>
          <Badge variant="glow" className="text-[10px] px-1.5 py-0">3</Badge>
        </div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-white">
          Close
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              onSelectAction(n.title);
              onClose();
            }}
            className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {n.icon}
                <span className="text-xs font-bold text-white">{n.title}</span>
              </div>
              <span className="text-[10px] text-gray-500">{n.time}</span>
            </div>
            <p className="text-xs text-gray-400 pl-6 leading-relaxed">{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
