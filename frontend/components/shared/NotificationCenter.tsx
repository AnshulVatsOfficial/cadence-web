"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Inbox, ArrowRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/lib/authContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface NotificationItem {
  id: string;
  userId: string;
  actorId?: string | null;
  actor?: {
    name?: string;
    email?: string;
    imageUrl?: string;
  } | null;
  type: string;
  title: string;
  body?: string | null;
  entityId?: string | null;
  projectId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const handleNewNotification = (newNotif: NotificationItem) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(newNotif.title, {
        description: newNotif.body || undefined,
      });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [user]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.entityId) {
      if (item.projectId) {
        router.push(`/projects/${item.projectId}?taskId=${item.entityId}`);
      } else {
        router.push(`/projects?taskId=${item.entityId}`);
      }
    }
  };

  const renderNotificationBody = (body?: string | null) => {
    if (!body) return null;
    const lines = body.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return <p className="text-muted-foreground leading-snug">{body}</p>;
    }
    return (
      <div className="space-y-0.5 mt-1">
        {lines.map((line, idx) => (
          <p key={idx} className="text-muted-foreground text-[11px] leading-tight flex items-start gap-1">
            <span className="font-semibold text-foreground/80">{line}</span>
          </p>
        ))}
      </div>
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "STAGE_CHANGED":
        return <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-200">Stage</Badge>;
      case "MENTIONED_IN_COMMENT":
        return <Badge variant="outline" className="text-[9px] px-1 py-0 bg-purple-50 text-purple-700 border-purple-200">Comment</Badge>;
      case "TASK_ASSIGNED":
        return <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">Task</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] px-1 py-0 bg-gray-50 text-gray-700 border-gray-200">Update</Badge>;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center rounded-full animate-pulse"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 sm:w-96" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/70">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start justify-between gap-3 p-3 transition-colors cursor-pointer hover:bg-accent/40 ${
                    item.isRead ? "bg-background" : "bg-primary/5 font-medium"
                  }`}
                >
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(item.type)}
                      <p className="text-foreground leading-snug font-semibold">{item.title}</p>
                    </div>
                    {renderNotificationBody(item.body)}
                    <span className="text-[10px] text-muted-foreground/70 block mt-1">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
