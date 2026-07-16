"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Bot, Calendar, Info, AlertOctagon, User, Check, Trash2, Bell, AlertTriangle } from "lucide-react";
import { NotificationsService, NotificationItem } from "@/services/notifications";
import { useAuth } from "@/providers/AuthProvider";

type FilterType = "all" | "unread" | "security" | "ai" | "event" | "system";

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [now, setNow] = useState<number>(0);

  const loadNotifications = useCallback(() => {
    if (!user) return;
    NotificationsService.getNotifications(user.id)
      .then((list) => {
        setNotifications(list);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg("Failed to retrieve notifications database.");
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, [notifications]);

  useEffect(() => {
    // Simulate loading state delay
    const timer = setTimeout(() => {
      loadNotifications();
    }, 450);

    window.addEventListener("stadium_notifications_update", loadNotifications);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("stadium_notifications_update", loadNotifications);
    };
  }, [loadNotifications]);

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Please sign in to view notifications.
      </div>
    );
  }

  // Action: Mark single notification as read
  const handleMarkRead = (id: string) => {
    NotificationsService.markAsRead(user.id, id);
    setLiveAnnouncement("Notification marked as read");
  };

  // Action: Mark all as read
  const handleMarkAllRead = () => {
    NotificationsService.markAllAsRead(user.id);
    setLiveAnnouncement("All notifications marked as read");
  };

  // Action: Delete notification
  const handleDelete = (id: string) => {
    NotificationsService.deleteNotification(user.id, id);
    setLiveAnnouncement("Notification deleted");
  };

  // Format relative timestamp
  const formatTime = (isoString: string) => {
    if (now === 0) return "...";
    const date = new Date(isoString);
    const diffMs = now - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Apply filters
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "security":
        return <Shield size={14} className="text-blue-500" />;
      case "ai":
        return <Bot size={14} className="text-purple-500" />;
      case "event":
        return <Calendar size={14} className="text-amber-500" />;
      case "emergency":
        return <AlertOctagon size={14} className="text-destructive animate-pulse" />;
      case "account":
        return <User size={14} className="text-green-500" />;
      default:
        return <Info size={14} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Accessibility Live Region for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {liveAnnouncement}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell size={20} className="text-primary" /> Notifications Center
          </h1>
          <p className="text-xs text-muted-foreground">Monitor real-time updates and emergency alerts.</p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold border border-border text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/50 scrollbar-none">
        {(
          [
            { id: "all", label: "All Logs" },
            { id: "unread", label: "Unread" },
            { id: "security", label: "Security" },
            { id: "ai", label: "AI Advice" },
            { id: "event", label: "Events" },
            { id: "system", label: "System" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              filter === tab.id
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Panel Content */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading notifications log...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-2xl p-6 flex items-center justify-center gap-2" role="alert">
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/60">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 transition-colors flex gap-4 items-start ${
                  !n.isRead ? "bg-primary/5" : "hover:bg-muted/30"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`text-xs ${!n.isRead ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}>
                        {n.title}
                      </h3>
                      <span className="text-[9px] text-muted-foreground/60">{formatTime(n.timestamp)}</span>
                    </div>

                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" aria-hidden="true" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Mark "${n.title}" as read`}
                    >
                      <Check size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Delete "${n.title}"`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
              <Bell size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">No alerts match your filter</p>
              <p className="text-[10px] text-muted-foreground">You are all caught up with stadium operations.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
