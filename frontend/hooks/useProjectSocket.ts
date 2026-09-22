import { useEffect, useState, useCallback } from "react";
import { getSocket } from "../lib/socket";

export interface OnlineUser {
  userId: string;
  name?: string | null;
  email?: string;
  role?: string;
  socketId: string;
}

interface UseProjectSocketOptions {
  projectId?: string | null;
  accessToken?: string | null;
  onProjectChange?: () => void;
}

export function useProjectSocket({
  projectId,
  accessToken,
  onProjectChange,
}: UseProjectSocketOptions) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId || !accessToken) return;

    const socket = getSocket(accessToken);

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
      socket.emit("project:join", { projectId });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const handleTaskChanged = () => {
      if (onProjectChange) onProjectChange();
    };

    const handleStageChanged = () => {
      if (onProjectChange) onProjectChange();
    };

    const handleCommentChanged = () => {
      if (onProjectChange) onProjectChange();
    };

    const handlePresenceUpdate = (data: { users: OnlineUser[] }) => {
      if (Array.isArray(data?.users)) {
        setOnlineUsers(data.users);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("task:changed", handleTaskChanged);
    socket.on("stage:changed", handleStageChanged);
    socket.on("comment:changed", handleCommentChanged);
    socket.on("presence:update", handlePresenceUpdate);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.emit("project:leave", { projectId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("task:changed", handleTaskChanged);
      socket.off("stage:changed", handleStageChanged);
      socket.off("comment:changed", handleCommentChanged);
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [projectId, accessToken, onProjectChange]);

  const sendTypingIndicator = useCallback(
    (taskId?: string, isTyping: boolean = true) => {
      if (!projectId || !accessToken) return;
      const socket = getSocket(accessToken);
      if (socket.connected) {
        socket.emit("user:typing", { projectId, taskId, isTyping });
      }
    },
    [projectId, accessToken],
  );

  return { onlineUsers, isConnected, sendTypingIndicator };
}
