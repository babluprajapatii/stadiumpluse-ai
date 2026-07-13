"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Shield, Bot, Calendar, Info, AlertOctagon, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { NotificationsService, NotificationItem } from "@/services/notifications";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = useCallback(() => {
    if (user) {
      NotificationsService.getNotifications(user.id).then((list) => {
        setNotifications(list);
      }).catch(() => {
        // Fallback
      });
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();

    // Listen to notification changes
    window.addEventListener("stadium_notifications_update", loadNotifications);
    return () => {
      window.removeEventListener("stadium_notifications_update", loadNotifications);
    };
  }, [loadNotifications]);

  if (!user) return null;

  const unreadList = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadList.length;
  const recentNotifications = notifications.slice(0, 5);

  const handleMarkAllRead = () => {
    NotificationsService.markAllAsRead(user.id);
  };

  const handleNotificationClick = (n: NotificationItem) => {
    NotificationsService.markAsRead(user.id, n.id);
    setOpen(false);
    router.push("/notifications");
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "security":
        return <Shield size={13} className="text-blue-500" />;
      case "ai":
        return <Bot size={13} className="text-purple-500" />;
      case "event":
        return <Calendar size={13} className="text-amber-500" />;
      case "emergency":
        return <AlertOctagon size={13} className="text-destructive animate-pulse" />;
      case "account":
        return <User size={13} className="text-green-500" />;
      default:
        return <Info size={13} className="text-muted-foreground" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <Bell size={16} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-destructive text-[8px] font-bold text-white flex items-center justify-center select-none"
              role="status"
            >
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border border-border bg-card shadow-lg rounded-xl z-50 mr-4" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <span className="text-xs font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[280px] overflow-y-auto divide-y divide-border/40">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 items-start cursor-pointer focus-visible:outline-none focus-visible:bg-muted"
              >
                <div className="w-6 h-6 rounded-lg bg-muted/65 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className={`text-[11px] truncate ${!n.isRead ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="py-10 text-center space-y-1">
              <p className="text-xs text-muted-foreground">All caught up!</p>
              <p className="text-[10px] text-muted-foreground/60">No new notifications.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-4 py-2 text-center">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/notifications");
            }}
            className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
