"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Loader2, Bot, User, RefreshCw, CheckCircle2, Zap, AlertCircle, Copy, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useProject } from "./ProjectContext";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import MoveTaskStageModal from "./MoveTaskStageModal";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  actionExecuted?: string;
  timestamp: Date;
  isError?: boolean;
}

const PRESET_PROMPTS = [
  { label: "📊 Project Summary", prompt: "Summarize the project status and task count by stage" },
  { label: "⇄ Move Stage", isModal: true },
  { label: "⚡ Auto-Decompose", fillInput: "Decompose this feature: " },
  { label: "🔍 High Priority Tasks", prompt: "List all high and urgent priority tasks in the project" },
];

function formatActionBadge(actionName: string) {
  const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
    invite_member: { label: "Member Invited", bg: "bg-[#E3FCEF]", text: "text-[#006644]", border: "border-[#ABF5D1]" },
    list_members: { label: "Members Checked", bg: "bg-[#F4F5F7]", text: "text-[#42526E]", border: "border-[#DFE1E6]" },
    create_stage: { label: "Column Created", bg: "bg-[#E3FCEF]", text: "text-[#006644]", border: "border-[#ABF5D1]" },
    rename_stage: { label: "Column Renamed", bg: "bg-[#DEEBFF]", text: "text-[#0747A6]", border: "border-[#B3D4FF]" },
    delete_stage: { label: "Column Deleted", bg: "bg-[#FFEBEB]", text: "text-[#BF2600]", border: "border-[#FFBDAD]" },
    create_note: { label: "Note Created", bg: "bg-[#E3FCEF]", text: "text-[#006644]", border: "border-[#ABF5D1]" },
    search_notes: { label: "Notes Searched", bg: "bg-[#F4F5F7]", text: "text-[#42526E]", border: "border-[#DFE1E6]" },
    get_team_workload: { label: "Workload Analyzed", bg: "bg-[#E3FCEF]", text: "text-[#006644]", border: "border-[#ABF5D1]" },
    get_overdue_tasks: { label: "Overdue Checked", bg: "bg-[#FFEBEB]", text: "text-[#BF2600]", border: "border-[#FFBDAD]" },
    bulk_move_tasks: { label: "Bulk Move", bg: "bg-[#DEEBFF]", text: "text-[#0747A6]", border: "border-[#B3D4FF]" },
    bulk_assign_tasks: { label: "Bulk Assign", bg: "bg-[#DEEBFF]", text: "text-[#0747A6]", border: "border-[#B3D4FF]" },
    create_task: { label: "Task Created", bg: "bg-[#E3FCEF]", text: "text-[#006644]", border: "border-[#ABF5D1]" },
    update_task: { label: "Task Updated", bg: "bg-[#DEEBFF]", text: "text-[#0747A6]", border: "border-[#B3D4FF]" },
    assign_task: { label: "Task Assigned", bg: "bg-[#DEEBFF]", text: "text-[#0747A6]", border: "border-[#B3D4FF]" },
    update_task_stage: { label: "Stage Updated", bg: "bg-[#DEEBFF]", text: "text-[#0747A6]", border: "border-[#B3D4FF]" },
    create_subtask: { label: "Subtask Created", bg: "bg-[#E3FCEF]", text: "text-[#006644]", border: "border-[#ABF5D1]" },
    delete_task: { label: "Task Deleted", bg: "bg-[#FFEBEB]", text: "text-[#BF2600]", border: "border-[#FFBDAD]" },
    add_comment: { label: "Comment Added", bg: "bg-[#EAE6FF]", text: "text-[#403294]", border: "border-[#C0B6F2]" },
    ai_generate_tickets: { label: "Tickets Generated", bg: "bg-[#E3FCEF]", text: "text-[#006644]", border: "border-[#ABF5D1]" },
    search_tasks: { label: "Board Searched", bg: "bg-[#F4F5F7]", text: "text-[#42526E]", border: "border-[#DFE1E6]" },
  };

  const item = map[actionName] || {
    label: actionName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    bg: "bg-[#F4F5F7]",
    text: "text-[#42526E]",
    border: "border-[#DFE1E6]",
  };

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[3px] border ${item.bg} ${item.border} ${item.text} text-[10px] font-semibold`}>
      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
      <span>{item.label}</span>
    </div>
  );
}

function renderPriorityBadgeTag(prioStr: string) {
  const prio = prioStr.replace(/[\[\]\(\)]/g, "").toUpperCase();
  if (prio === "URGENT") {
    return (
      <span key={prioStr} className="inline-flex items-center space-x-1 text-[#DE350B] font-bold text-[10px] ml-1.5 align-middle">
        <span>↑</span>
        <span>URGENT</span>
      </span>
    );
  }
  if (prio === "HIGH") {
    return (
      <span key={prioStr} className="inline-flex items-center space-x-1 text-[#FF5630] font-bold text-[10px] ml-1.5 align-middle">
        <span>↑</span>
        <span>HIGH</span>
      </span>
    );
  }
  if (prio === "MEDIUM") {
    return (
      <span key={prioStr} className="inline-flex items-center space-x-1 text-[#FFAB00] font-bold text-[10px] ml-1.5 align-middle">
        <span>═</span>
        <span>MEDIUM</span>
      </span>
    );
  }
  if (prio === "LOW") {
    return (
      <span key={prioStr} className="inline-flex items-center space-x-1 text-[#36B37E] font-bold text-[10px] ml-1.5 align-middle">
        <span>↓</span>
        <span>LOW</span>
      </span>
    );
  }
  return prioStr;
}

function renderFormattedText(text: string) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, lIdx) => {
        const parts = line.split(/(\*\*.*?\*\*|`.*?`|\[(?:URGENT|HIGH|MEDIUM|LOW)\]|\((?:Urgent|High|Medium|Low)\))/gi);
        return (
          <p key={lIdx} className="leading-normal">
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                return (
                  <strong key={pIdx} className="font-bold text-[#172B4D]">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
                return (
                  <code key={pIdx} className="bg-[#F4F5F7] border border-[#DFE1E6] px-1 py-0.5 rounded text-[11px] font-mono text-[#0747A6]">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              if (/^\[(?:URGENT|HIGH|MEDIUM|LOW)\]$/i.test(part) || /^\((?:Urgent|High|Medium|Low)\)$/i.test(part)) {
                return renderPriorityBadgeTag(part);
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function AICopilotChatDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { activeProject, fetchProjectDetails } = useProject();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMoveStageModal, setShowMoveStageModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyMessage = (id: string, rawText: string) => {
    const cleanText = rawText.replace(/\*\*/g, "").replace(/`/g, "");

    let copySuccessful = false;

    try {
      const el = document.createElement("textarea");
      el.value = cleanText;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);

      const selection = document.getSelection();
      const selected = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      el.select();
      copySuccessful = document.execCommand("copy");
      document.body.removeChild(el);

      if (selected && selection) {
        selection.removeAllRanges();
        selection.addRange(selected);
      }
    } catch (err) {
      console.error("[AICopilotChatDrawer] execCommand copy error:", err);
    }

    if (!copySuccessful && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanText).catch(() => {});
    }

    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && activeProject) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Hello! I am **Cadence AI Copilot** for **${activeProject.name}**.\n\nYou can ask me to create tasks (e.g. *"Create a high priority task titled Implement OAuth 2.0 login in Backlog and assign it to Anshul"*), move cards between stages, or summarize project status directly.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, activeProject]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || !activeProject || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      const res = await api.post(`/projects/${activeProject.id}/ai-chat`, {
        message: text,
      });

      const aiReply = res.data?.reply || "I've completed the requested action.";
      const actionExecuted = res.data?.actionExecuted;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReply,
        actionExecuted,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Refresh project details when an action was executed
      if (actionExecuted) {
        await fetchProjectDetails();
      }
    } catch (error: any) {
      console.error("[AICopilotChatDrawer] Technical Error:", error);

      let userFriendlyText = "I encountered an issue completing your request. Please ensure your backend server is running and try again.";

      if (error?.response?.status === 404) {
        userFriendlyText = "Unable to connect to the backend AI service. Please verify the backend server is running on port 4000.";
      } else if (error?.response?.status === 500) {
        userFriendlyText = "The AI service is currently unavailable or your API key needs configuration. Please check your backend settings.";
      }

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: userFriendlyText,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveModalSuccess = (details: {
    taskTitle: string;
    issueKey: string;
    fromStage: string;
    toStage: string;
  }) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: `Move task [${details.issueKey}] ${details.taskTitle} from ${details.fromStage} to ${details.toStage}`,
      timestamp: new Date(),
    };

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: `Successfully moved task **[${details.issueKey}] ${details.taskTitle}** and all of its subtasks from **${details.fromStage}** to **${details.toStage}**.`,
      actionExecuted: "update_task_stage",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-[#DFE1E6] shadow-2xl z-50 flex flex-col transition-all animate-in slide-in-from-right duration-200">

        {/* ── JIRA HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#DFE1E6] bg-[#FAFBFC]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-[3px] bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] flex items-center gap-1.5">
                <span>Cadence Copilot</span>
                <span className="text-[9px] font-semibold bg-[#DEEBFF] text-[#0747A6] px-1.5 py-0.5 rounded-[2px] border border-[#B3D4FF]">
                  AI
                </span>
              </h2>
              <p className="text-[10px] text-[#5E6C84]">
                {activeProject ? activeProject.name : "Multi-purpose Assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessages([])}
              title="Reset Chat"
              className="h-7 w-7 text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] rounded-[3px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── CHAT MESSAGES BODY ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFBFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                {msg.sender === "ai" ? (
                  <>
                    <Bot className="w-3 h-3 text-[#0052CC]" />
                    <span className="text-[10px] font-bold text-[#172B4D]">Cadence AI</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-[#5E6C84]" />
                    <span className="text-[10px] font-bold text-[#5E6C84]">You</span>
                  </>
                )}
                <span className="text-[9px] text-[#8993A4]">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div
                className={`max-w-[88%] text-xs rounded-[4px] p-3 leading-relaxed ${msg.sender === "user"
                    ? "bg-[#0052CC] text-white shadow-sm font-medium"
                    : msg.isError
                      ? "bg-[#FFBDAD]/20 border border-[#FFBDAD] text-[#BF2600]"
                      : "bg-white text-[#172B4D] border border-[#DFE1E6] shadow-sm"
                  }`}
              >
                {msg.isError && (
                  <div className="flex items-center space-x-1.5 mb-1.5 font-semibold text-[#BF2600]">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Notice</span>
                  </div>
                )}

                {renderFormattedText(msg.text)}

                {/* AI RESPONSE ACTION FOOTER & COPY BUTTON */}
                {msg.sender === "ai" && !msg.isError && (
                  <div className="mt-3 pt-2 border-t border-[#DFE1E6] flex items-center justify-between gap-2">
                    {msg.actionExecuted ? (
                      formatActionBadge(msg.actionExecuted)
                    ) : (
                      <span className="text-[9px] text-[#8993A4] font-medium">Cadence AI</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="inline-flex items-center space-x-1.5 px-2 py-1 bg-[#F4F5F7] hover:bg-[#DEEBFF] text-[#42526E] hover:text-[#0747A6] border border-[#DFE1E6] hover:border-[#B3D4FF] rounded-[3px] text-[10px] font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#00875A]" />
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#0052CC]" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-1.5 mb-1 px-1">
                <Bot className="w-3 h-3 text-[#0052CC]" />
                <span className="text-[10px] font-bold text-[#172B4D]">Cadence AI</span>
              </div>
              <div className="bg-white border border-[#DFE1E6] text-[#5E6C84] text-xs p-3 rounded-[4px] shadow-sm flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0052CC]" />
                <span>Analyzing request & updating project board...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── PRESET QUICK SUGGESTIONS ─────────────────────────────────────── */}
        <div className="px-4 py-2 border-t border-[#DFE1E6] bg-white flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => {
                if (item.isModal) {
                  setShowMoveStageModal(true);
                } else if (item.fillInput) {
                  setInputValue(item.fillInput);
                  setTimeout(() => textareaRef.current?.focus(), 50);
                } else if (item.prompt) {
                  handleSendMessage(item.prompt);
                }
              }}
              className="text-[10px] font-semibold bg-[#F4F5F7] hover:bg-[#DEEBFF] text-[#42526E] hover:text-[#0747A6] px-2 py-1 rounded-[3px] border border-[#DFE1E6] hover:border-[#B3D4FF] transition-all flex items-center space-x-1 disabled:opacity-50"
            >
              <Zap className="w-2.5 h-2.5 text-[#0052CC]" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── MULTI-PURPOSE INPUT FOOTER ──────────────────────────────────── */}
        <div className="p-3 border-t border-[#DFE1E6] bg-white">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask AI to create tasks, move stages, or summarize board..."
              rows={2}
              className="w-full pr-10 text-xs bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#0052CC] resize-none"
            />
            <Button
              disabled={loading || !inputValue.trim()}
              onClick={() => handleSendMessage()}
              size="icon"
              className="absolute right-2 bottom-2 h-7 w-7 bg-[#0052CC] hover:bg-[#0747A6] text-white rounded-[3px] transition-all disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <p className="text-[9px] text-[#8993A4] mt-1.5 text-center">
            Press <kbd className="font-mono bg-[#F4F5F7] px-1 rounded border border-[#DFE1E6]">Enter</kbd> to send, <kbd className="font-mono bg-[#F4F5F7] px-1 rounded border border-[#DFE1E6]">Shift+Enter</kbd> for new line.
          </p>
        </div>
      </div>

      {/* INTERACTIVE MOVE STAGE DIALOG */}
      <MoveTaskStageModal
        isOpen={showMoveStageModal}
        onClose={() => setShowMoveStageModal(false)}
        onSuccess={handleMoveModalSuccess}
      />
    </>
  );
}
