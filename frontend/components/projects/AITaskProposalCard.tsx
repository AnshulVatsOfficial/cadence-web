"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Loader2, AlertCircle, Calendar, Clock, User, Layers, ShieldAlert, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useProject } from "./ProjectContext";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { convertToMinutes } from "@/lib/timeUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface AITaskDraftProps {
  initialTitle?: string;
  initialDescription?: string;
  initialStageId?: string;
  initialPriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  initialParentTaskId?: string | null;
  initialAssigneeIds?: string[];
  initialDueDate?: string;
  initialEstimateValue?: string;
  initialEstimateUnit?: "m" | "h" | "d" | "w";
}

interface AITaskProposalCardProps {
  draft: AITaskDraftProps;
  onSuccess: (createdTask: any) => void;
  onCancel: () => void;
}

export default function AITaskProposalCard({
  draft,
  onSuccess,
  onCancel,
}: AITaskProposalCardProps) {
  const { activeProject, projectDetails, projectMembers, fetchProjectDetails } = useProject();

  const stages = activeProject?.stages || projectDetails?.stages || [];
  const tasks = activeProject?.tasks || projectDetails?.tasks || [];
  const availableParentTasks = tasks.filter((t: any) => !t.parentTaskId);

  // 8 TASK FIELDS STATE
  const [title, setTitle] = useState(draft.initialTitle || "");
  const [description, setDescription] = useState(draft.initialDescription || "");
  const [stageId, setStageId] = useState(draft.initialStageId || stages[0]?.id || "");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">(
    draft.initialPriority || "MEDIUM"
  );
  const [parentTaskId, setParentTaskId] = useState<string>(
    draft.initialParentTaskId || "none"
  );
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>(
    draft.initialAssigneeIds?.[0] || "none"
  );
  const [dueDate, setDueDate] = useState<string>(draft.initialDueDate || "");
  const [estimateValue, setEstimateValue] = useState<string>(draft.initialEstimateValue || "");
  const [estimateUnit, setEstimateUnit] = useState<"m" | "h" | "d" | "w">(draft.initialEstimateUnit || "h");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-set default stageId when stages load
  useEffect(() => {
    if (!stageId && stages.length > 0) {
      setStageId(stages[0].id);
    }
  }, [stages, stageId]);

  const handleCreateTask = async () => {
    if (!title.trim() || title.trim().length < 3) {
      setError("Task title must be at least 3 characters.");
      return;
    }
    if (!activeProject?.id) {
      setError("Active project context missing.");
      return;
    }

    const targetStageId = stageId || stages[0]?.id;
    if (!targetStageId) {
      setError("Please select a valid stage.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let estimatedMinutes: number | null = null;
      if (estimateValue && !isNaN(Number(estimateValue))) {
        estimatedMinutes = convertToMinutes(Number(estimateValue), estimateUnit);
      }

      const issueTypes = projectDetails?.issueTypes || [];
      const defaultIssueTypeId = issueTypes[0]?.id;

      const payload: any = {
        title: title.trim(),
        stageId: targetStageId,
        priority,
        description: description.trim() || undefined,
        issueTypeId: defaultIssueTypeId,
        parentTaskId: parentTaskId === "none" ? null : parentTaskId,
        assigneeIds: selectedAssigneeId === "none" ? [] : [selectedAssigneeId],
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        estimatedMinutes,
      };

      const res = await api.post(`/projects/${activeProject.id}/tasks`, payload);
      const created = res.data;

      await fetchProjectDetails();
      onSuccess(created);
    } catch (err: any) {
      console.error("[AITaskProposalCard] Error creating task:", err);
      setError(err?.response?.data?.error?.message || "Failed to create task. Please verify inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#0052CC]/40 rounded-[6px] p-3.5 shadow-md space-y-3 animate-in fade-in zoom-in-95 duration-150 my-1">
      {/* HEADER BANNER */}
      <div className="flex items-center justify-between pb-2 border-b border-[#DFE1E6]">
        <div className="flex items-center space-x-1.5 text-[#0052CC]">
          <Sparkles className="w-3.5 h-3.5 text-[#0052CC]" />
          <span className="text-xs font-bold">AI Task Proposal (8 Fields)</span>
        </div>
        <span className="text-[9px] font-semibold bg-[#DEEBFF] text-[#0747A6] px-1.5 py-0.5 rounded-[2px]">
          Smart Draft
        </span>
      </div>

      {error && (
        <div className="p-2 bg-[#FFBDAD]/20 border border-[#FFBDAD] text-[#BF2600] rounded-[3px] text-[11px] flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. TASK TITLE */}
      <div>
        <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
          1. Task Title <span className="text-[#DE350B]">*</span>
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Implement authentication flow"
          className="h-8 text-xs bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] focus-visible:ring-[#0052CC]"
        />
      </div>

      {/* 2. STAGE & 3. PRIORITY */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
            2. Column / Stage
          </label>
          <Select value={stageId} onValueChange={(val) => setStageId(val)}>
            <SelectTrigger className="w-full h-8 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D]">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#DFE1E6]">
              {stages.map((s: any) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
            3. Priority
          </label>
          <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
            <SelectTrigger className="w-full h-8 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D]">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#DFE1E6]">
              <SelectItem value="URGENT" className="text-xs text-[#DE350B] font-bold">↑ URGENT</SelectItem>
              <SelectItem value="HIGH" className="text-xs text-[#FF5630] font-bold">↑ HIGH</SelectItem>
              <SelectItem value="MEDIUM" className="text-xs text-[#FFAB00] font-bold">═ MEDIUM</SelectItem>
              <SelectItem value="LOW" className="text-xs text-[#36B37E] font-bold">↓ LOW</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. PARENT TASK */}
      <div>
        <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
          4. Parent Task (Optional - for Subtasks)
        </label>
        <Select value={parentTaskId} onValueChange={(val) => setParentTaskId(val)}>
          <SelectTrigger className="w-full h-8 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D]">
            <SelectValue placeholder="None (Main Parent Task)" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#DFE1E6] max-h-48">
            <SelectItem value="none" className="text-xs">None (Main Parent Task)</SelectItem>
            {availableParentTasks.map((pt: any) => (
              <SelectItem key={pt.id} value={pt.id} className="text-xs">
                {pt.issueKey ? `[${pt.issueKey}] ` : ""}{pt.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 5. DESCRIPTION */}
      <div>
        <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
          5. Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Technical details & acceptance criteria..."
          rows={2}
          className="text-xs bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] resize-none focus-visible:ring-[#0052CC]"
        />
      </div>

      {/* 6. ASSIGNEES */}
      <div>
        <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
          6. Assignee
        </label>
        <Select value={selectedAssigneeId} onValueChange={(val) => setSelectedAssigneeId(val)}>
          <SelectTrigger className="w-full h-8 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D]">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#DFE1E6]">
            <SelectItem value="none" className="text-xs">Unassigned</SelectItem>
            {(projectMembers || []).map((m: any, idx: number) => {
              const userId = m?.user?.id || m?.userId || m?.id;
              const userName = m?.user?.name || m?.user?.email || m?.name || m?.email || "Member";
              const role = m?.role ? ` (${m.role})` : "";
              if (!userId) return null;

              return (
                <SelectItem key={userId || idx} value={userId} className="text-xs">
                  {userName}{role}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* 7. DUE DATE & 8. TIME ESTIMATE */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
            7. Due Date
          </label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-8 text-xs bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#172B4D] mb-1">
            8. Time Estimate
          </label>
          <div className="flex space-x-1">
            <Input
              type="number"
              value={estimateValue}
              onChange={(e) => setEstimateValue(e.target.value)}
              placeholder="e.g. 4"
              className="h-8 text-xs bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] w-2/3"
            />
            <Select value={estimateUnit} onValueChange={(val: any) => setEstimateUnit(val)}>
              <SelectTrigger className="h-8 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs w-1/3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE1E6]">
                <SelectItem value="m" className="text-xs">Mins</SelectItem>
                <SelectItem value="h" className="text-xs">Hours</SelectItem>
                <SelectItem value="d" className="text-xs">Days</SelectItem>
                <SelectItem value="w" className="text-xs">Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DFE1E6]">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-7 text-xs text-[#42526E] hover:bg-[#EBECF0] px-2.5"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={loading || !title.trim()}
          onClick={handleCreateTask}
          className="h-7 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-semibold px-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span>Create Task</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
