"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import {
  MessageSquare,
  Send,
  Trash2,
  Loader2,
  History,
  UserPlus,
  Reply,
  CornerDownRight,
  Pencil,
  Check,
  X,
  WifiOff,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface CommentNode {
  comment: any;
  children: CommentNode[];
}

interface CommentListProps {
  projectId: string;
  taskId: string;
  isWritable: boolean;
  taskAssignees?: any[];
  subtasks?: any[];
}

const getInitials = (name?: string | null, email?: string) => {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (email) return email.substring(0, 2).toUpperCase();
  return "US";
};

function CommentItem({
  node,
  projectId,
  taskId,
  isWritable,
  currentUser,
  onDelete,
  onPostReply,
  onUpdateComment,
  replyingToId,
  setReplyingToId,
  replyText,
  setReplyText,
  isPostingReply,
  editingId,
  setEditingId,
  editText,
  setEditText,
  isUpdating,
  deletingId,
  isOnline,
}: {
  node: CommentNode;
  projectId: string;
  taskId: string;
  isWritable: boolean;
  currentUser: any;
  onDelete: (id: string) => void;
  onPostReply: (parentId: string) => void;
  onUpdateComment: (commentId: string) => void;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  isPostingReply: boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editText: string;
  setEditText: (text: string) => void;
  isUpdating: boolean;
  deletingId: string | null;
  isOnline: boolean;
}) {
  const comment = node.comment;
  const isOwner = currentUser?.id === comment.userId;
  const isReplying = replyingToId === comment.id;
  const isEditing = editingId === comment.id;

  const authorName =
    comment.user?.name ||
    (comment.user?.email && !(!comment.user.email.includes("@") && comment.user.email.length > 20)
      ? comment.user.email
      : "User");
  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "just now";
  const isEdited = comment.updatedAt && comment.createdAt !== comment.updatedAt;

  return (
    <div className="space-y-2">
      <div className="flex gap-2.5 p-2.5 bg-white border border-[#DFE1E6] rounded-[4px] shadow-2xs group relative">
        <div className="w-6 h-6 rounded-full bg-[#0052CC] text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
          {getInitials(comment.user?.name, comment.user?.email)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#172B4D]">{authorName}</span>
              <span className="text-[10px] text-[#5E6C84]">
                {timeAgo} {isEdited && <span className="italic font-normal">(edited)</span>}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isWritable && !isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (isReplying) {
                      setReplyingToId(null);
                      setReplyText("");
                    } else {
                      setReplyingToId(comment.id);
                      setReplyText("");
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 text-[10px] font-semibold text-[#0052CC] hover:bg-[#DEEBFF] rounded-[2px] flex items-center gap-1"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              )}

              {isOwner && isWritable && !isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditText(comment.content);
                      setReplyingToId(null);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#5E6C84] hover:text-[#0052CC] hover:bg-[#DEEBFF] rounded-[2px]"
                    title="Edit comment"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#5E6C84] hover:text-[#DE350B] hover:bg-red-50 rounded-[2px]"
                    title="Delete comment and all replies"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Comment Content / Edit Textarea */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    onUpdateComment(comment.id);
                  }
                }}
                rows={2}
                autoFocus
                className="text-xs border-[#DFE1E6] resize-none focus-visible:ring-1 focus-visible:ring-[#0052CC] bg-white"
              />
              <div className="flex justify-end items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(null);
                    setEditText("");
                  }}
                  className="h-6 text-[10px] text-[#5E6C84] hover:bg-[#EBECF0] px-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => onUpdateComment(comment.id)}
                  disabled={!editText.trim() || isUpdating || !isOnline}
                  size="sm"
                  className="h-6 text-[10px] bg-[#0052CC] hover:bg-[#0747A6] text-white px-2.5 flex items-center gap-1 rounded-[3px]"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#172B4D] mt-1 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          )}

          {/* Inline Reply Input */}
          {isReplying && !isEditing && (
            <div className="mt-2.5 pt-2 border-t border-[#DFE1E6] space-y-2">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#0052CC]">
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Replying to {authorName}</span>
              </div>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    onPostReply(comment.id);
                  }
                }}
                placeholder="Write a reply... (Ctrl+Enter to post)"
                rows={2}
                autoFocus
                className="text-xs border-[#DFE1E6] resize-none focus-visible:ring-1 focus-visible:ring-[#0052CC] bg-white"
              />
              <div className="flex justify-end items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingToId(null);
                    setReplyText("");
                  }}
                  className="h-6 text-[11px] text-[#5E6C84] hover:bg-[#EBECF0] px-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => onPostReply(comment.id)}
                  disabled={!replyText.trim() || isPostingReply || !isOnline}
                  size="sm"
                  className="h-6 text-[11px] bg-[#0052CC] hover:bg-[#0747A6] text-white px-2.5 flex items-center gap-1 rounded-[3px]"
                >
                  {isPostingReply ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Post Reply</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Children Comments (Indented with a clean left guide line) */}
      {node.children.length > 0 && (
        <div className="ml-3 pl-2.5 sm:ml-4 sm:pl-3 border-l-2 border-[#DFE1E6] space-y-2 mt-2">
          {node.children.map((childNode) => (
            <CommentItem
              key={childNode.comment.id}
              node={childNode}
              projectId={projectId}
              taskId={taskId}
              isWritable={isWritable}
              currentUser={currentUser}
              onDelete={onDelete}
              onPostReply={onPostReply}
              onUpdateComment={onUpdateComment}
              replyingToId={replyingToId}
              setReplyingToId={setReplyingToId}
              replyText={replyText}
              setReplyText={setReplyText}
              isPostingReply={isPostingReply}
              editingId={editingId}
              setEditingId={setEditingId}
              editText={editText}
              setEditText={setEditText}
              isUpdating={isUpdating}
              deletingId={deletingId}
              isOnline={isOnline}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentList({
  projectId,
  taskId,
  isWritable,
  taskAssignees = [],
  subtasks = [],
}: CommentListProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "history">("comments");
  const [comments, setComments] = useState<any[]>([]);

  // Draft persistence key for LocalStorage
  const DRAFT_KEY = `cadence_comment_draft_${taskId}`;

  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Network Online/Offline state tracking
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== "undefined" ? navigator.onLine : true,
  );

  // Delete confirmation modal states
  const [commentToDeleteId, setCommentToDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPostingReply, setIsPostingReply] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    if (typeof window !== "undefined" && taskId) {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setNewComment(saved);
      }
    }
  }, [taskId, DRAFT_KEY]);

  // Network status event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Connection restored.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Internet connection lost. Comment draft is saved locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save top-level draft as user types
  const handleCommentChange = (text: string) => {
    setNewComment(text);
    if (typeof window !== "undefined" && taskId) {
      if (text.trim()) {
        localStorage.setItem(DRAFT_KEY, text);
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/tasks/${taskId}/comments`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && taskId) {
      fetchComments();
    }
  }, [projectId, taskId]);

  // Create top-level comment (With network resilience)
  const handlePostComment = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || isPosting || !isWritable) return;

    if (!isOnline) {
      toast.warning("You are offline. Your draft is saved locally and will not be lost.");
      return;
    }

    try {
      setIsPosting(true);
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment("");
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_KEY);
      }
      toast.success("Comment added");
    } catch (err: any) {
      console.error("Failed to post comment", err);
      const isNetError = !navigator.onLine || err.code === "ERR_NETWORK" || !err.response;
      if (isNetError) {
        toast.error("Network connection interrupted! Your draft is safely saved locally. Click to retry when back online.");
      } else {
        toast.error(err.response?.data?.error || "Failed to post comment");
      }
    } finally {
      setIsPosting(false);
    }
  };

  // Create nested reply (With network resilience)
  const handlePostReply = async (parentId: string) => {
    if (!replyText.trim() || isPostingReply || !isWritable) return;

    if (!isOnline) {
      toast.warning("You are offline. Please reconnect to post replies.");
      return;
    }

    try {
      setIsPostingReply(true);
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, {
        content: replyText.trim(),
        replyToId: parentId,
      });
      setComments((prev) => [...prev, res.data.comment]);
      setReplyText("");
      setReplyingToId(null);
      toast.success("Reply added");
    } catch (err: any) {
      console.error("Failed to post reply", err);
      const isNetError = !navigator.onLine || err.code === "ERR_NETWORK" || !err.response;
      if (isNetError) {
        toast.error("Network connection interrupted! Your reply draft is retained. Retry when online.");
      } else {
        toast.error(err.response?.data?.error || "Failed to post reply");
      }
    } finally {
      setIsPostingReply(false);
    }
  };

  // Update existing comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim() || isUpdating || !isWritable) return;

    if (!isOnline) {
      toast.warning("You are offline. Please reconnect to save changes.");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await api.patch(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
        content: editText.trim(),
      });
      setComments((prev) => prev.map((c) => (c.id === commentId ? res.data.comment : c)));
      setEditingId(null);
      setEditText("");
      toast.success("Comment updated");
    } catch (err: any) {
      console.error("Failed to update comment", err);
      toast.error(err.response?.data?.error || "Failed to update comment");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete comment with cascading delete of nested replies
  const handleConfirmDeleteComment = async () => {
    if (!commentToDeleteId) return;

    if (!isOnline) {
      toast.warning("You are offline. Please reconnect to delete comments.");
      return;
    }

    try {
      setDeletingId(commentToDeleteId);
      const res = await api.delete(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentToDeleteId}`,
      );
      const deletedIds: string[] = res.data.deletedIds || [commentToDeleteId];
      setComments((prev) => prev.filter((c) => !deletedIds.includes(c.id)));
      setCommentToDeleteId(null);
      toast.success("Comment and replies deleted");
    } catch (err: any) {
      console.error("Failed to delete comment", err);
      toast.error(err.response?.data?.error || "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  // Build comment tree (parents and nested children)
  const commentTree = useMemo(() => {
    const map: { [id: string]: CommentNode } = {};
    const roots: CommentNode[] = [];

    comments.forEach((c) => {
      map[c.id] = { comment: c, children: [] };
    });

    comments.forEach((c) => {
      if (c.replyToId && map[c.replyToId]) {
        map[c.replyToId].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  }, [comments]);

  // Compile assignment history timestamps
  const assignmentHistory = useMemo(() => {
    const history: any[] = [];

    if (Array.isArray(taskAssignees)) {
      taskAssignees.forEach((a: any) => {
        if (a.user) {
          history.push({
            id: `task-assignee-${a.id || a.userId}`,
            userName:
              a.user.name ||
              (a.user.email && !(!a.user.email.includes("@") && a.user.email.length > 20)
                ? a.user.email
                : "User"),
            userEmail: a.user.email,
            targetType: "task",
            timestamp: a.createdAt || a.assignedAt || new Date().toISOString(),
          });
        }
      });
    }

    if (Array.isArray(subtasks)) {
      subtasks.forEach((st: any) => {
        if (Array.isArray(st.assignees)) {
          st.assignees.forEach((a: any) => {
            if (a.user) {
              history.push({
                id: `subtask-assignee-${st.id}-${a.id || a.userId}`,
                userName:
                  a.user.name ||
                  (a.user.email && !(!a.user.email.includes("@") && a.user.email.length > 20)
                    ? a.user.email
                    : "User"),
                userEmail: a.user.email,
                targetType: "subtask",
                subtaskTitle: st.title,
                timestamp: a.createdAt || a.assignedAt || new Date().toISOString(),
              });
            }
          });
        }
      });
    }

    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [taskAssignees, subtasks]);

  return (
    <div className="space-y-3">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 p-2 bg-[#FFF0B3] border border-[#FFAB00] text-[#172B4D] rounded-[4px] text-xs">
          <WifiOff className="w-4 h-4 text-[#FF8B00] shrink-0" />
          <span>
            You are currently offline. Your comment draft is saved locally and can be posted once reconnected.
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#DFE1E6] pb-2">
        <Label className="text-xs font-semibold text-[#172B4D] flex items-center space-x-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#0052CC]" />
          <span>Activity</span>
        </Label>

        <div className="flex items-center gap-1 bg-[#F4F5F7] p-0.5 rounded-[4px] border border-[#DFE1E6]">
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-[3px] transition-colors ${
              activeTab === "comments"
                ? "bg-white text-[#0052CC] shadow-2xs"
                : "text-[#5E6C84] hover:text-[#172B4D]"
            }`}
          >
            Comments ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-2 py-1 text-[11px] font-semibold rounded-[3px] transition-colors flex items-center gap-1 ${
              activeTab === "history"
                ? "bg-white text-[#0052CC] shadow-2xs"
                : "text-[#5E6C84] hover:text-[#172B4D]"
            }`}
          >
            <History className="w-3 h-3" />
            <span>Assignments ({assignmentHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "comments" ? (
        <>
          {/* Main Top-Level Comment Box */}
          {isWritable && (
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => handleCommentChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
                placeholder="Write a comment... (Ctrl+Enter to post)"
                rows={2}
                className="text-xs border-[#DFE1E6] resize-none focus-visible:ring-1 focus-visible:ring-[#0052CC] bg-white"
              />
              <div className="flex justify-end items-center gap-2">
                {newComment.trim() && (
                  <span className="text-[10px] text-[#36B37E] font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#36B37E]" />
                    Draft saved
                  </span>
                )}
                <span className="text-[10px] text-[#5E6C84]">Ctrl+Enter to post</span>
                <Button
                  type="button"
                  onClick={() => handlePostComment()}
                  disabled={!newComment.trim() || isPosting || !isOnline}
                  size="sm"
                  className="h-7 text-xs bg-[#0052CC] hover:bg-[#0747A6] text-white px-3 flex items-center gap-1.5 rounded-[3px]"
                >
                  {isPosting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>{isOnline ? "Comment" : "Offline"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Nested Comments Tree Feed */}
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-[#0052CC]" />
            </div>
          ) : commentTree.length === 0 ? (
            <p className="text-xs text-[#5E6C84] italic text-center py-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px]">
              No comments yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2.5 custom-scrollbar">
              {commentTree.map((rootNode) => (
                <CommentItem
                  key={rootNode.comment.id}
                  node={rootNode}
                  projectId={projectId}
                  taskId={taskId}
                  isWritable={isWritable}
                  currentUser={user}
                  onDelete={(id) => setCommentToDeleteId(id)}
                  onPostReply={handlePostReply}
                  onUpdateComment={handleUpdateComment}
                  replyingToId={replyingToId}
                  setReplyingToId={setReplyingToId}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  isPostingReply={isPostingReply}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  editText={editText}
                  setEditText={setEditText}
                  isUpdating={isUpdating}
                  deletingId={deletingId}
                  isOnline={isOnline}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Assignment History Tab */
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2.5 custom-scrollbar">
          {assignmentHistory.length === 0 ? (
            <p className="text-xs text-[#5E6C84] italic text-center py-3 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[3px]">
              No assignment history recorded yet.
            </p>
          ) : (
            assignmentHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 p-2.5 bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] text-xs"
              >
                <div className="p-1 bg-[#EAE6FF] text-[#403294] rounded-full mt-0.5 flex-shrink-0">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#172B4D] leading-snug">
                    <span className="font-bold">{item.userName}</span> was assigned to{" "}
                    <span className="font-semibold text-[#0052CC]">
                      {item.targetType === "subtask" ? `subtask "${item.subtaskTitle}"` : "this task"}
                    </span>
                    .
                  </p>
                  <p className="text-[10px] text-[#5E6C84] mt-0.5">
                    {format(new Date(item.timestamp), "MMM d, yyyy 'at' h:mm a")} (
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })})
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Comment Confirmation Dialog */}
      <CustomAlertDialog
        isOpen={!!commentToDeleteId}
        onClose={() => setCommentToDeleteId(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? Any nested replies under this comment will also be permanently deleted."
        confirmText="Delete"
        variant="danger"
        isLoading={!!deletingId}
      />
    </div>
  );
}
