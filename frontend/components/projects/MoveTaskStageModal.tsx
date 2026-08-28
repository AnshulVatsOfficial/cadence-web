"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight, Layers, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useProject } from "./ProjectContext";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface MoveTaskStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (details: { taskTitle: string; issueKey: string; fromStage: string; toStage: string }) => void;
}

export default function MoveTaskStageModal({
  isOpen,
  onClose,
  onSuccess,
}: MoveTaskStageModalProps) {
  const { activeProject, projectDetails, fetchProjectDetails } = useProject();

  const stages = activeProject?.stages || projectDetails?.stages || [];
  const tasks = activeProject?.tasks || projectDetails?.tasks || [];

  const [sourceStageId, setSourceStageId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [targetStageId, setTargetStageId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize default stage when modal opens
  useEffect(() => {
    if (isOpen && stages.length > 0) {
      const firstStageId = stages[0].id;
      setSourceStageId(firstStageId);
      setError(null);
    }
  }, [isOpen, stages]);

  // Filter tasks belonging to selected source stage (only parent tasks)
  const availableTasks = tasks.filter(
    (t: any) => t.stageId === sourceStageId && !t.parentTaskId
  );

  // Auto-select first available task when source stage changes
  useEffect(() => {
    if (availableTasks.length > 0) {
      setSelectedTaskId(availableTasks[0].id);
    } else {
      setSelectedTaskId("");
    }
  }, [sourceStageId, availableTasks.length]);

  // Target stages excluding current source stage
  const availableTargetStages = stages.filter((s: any) => s.id !== sourceStageId);

  // Auto-select first target stage
  useEffect(() => {
    if (availableTargetStages.length > 0) {
      setTargetStageId(availableTargetStages[0].id);
    } else {
      setTargetStageId("");
    }
  }, [sourceStageId, availableTargetStages.length]);

  const selectedTaskObj = tasks.find((t: any) => t.id === selectedTaskId);
  const sourceStageObj = stages.find((s: any) => s.id === sourceStageId);
  const targetStageObj = stages.find((s: any) => s.id === targetStageId);
  const subtasksCount = selectedTaskObj?.subtasks?.length || 0;

  const handleMoveTask = async () => {
    if (!selectedTaskId || !targetStageId || loading) return;
    setLoading(true);
    setError(null);

    try {
      await api.patch(`/projects/${activeProject.id}/tasks/${selectedTaskId}`, {
        stageId: targetStageId,
      });

      await fetchProjectDetails();

      if (onSuccess && selectedTaskObj && sourceStageObj && targetStageObj) {
        onSuccess({
          taskTitle: selectedTaskObj.title,
          issueKey: selectedTaskObj.issueKey || "Task",
          fromStage: sourceStageObj.name,
          toStage: targetStageObj.name,
        });
      }

      onClose();
    } catch (err: any) {
      console.error("[MoveTaskStageModal] Error moving task:", err);
      setError(err?.response?.data?.error?.message || "Failed to move task stage. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-[6px] border border-[#DFE1E6] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#DFE1E6] bg-[#FAFBFC]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-[3px] bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-bold text-[#172B4D]">Move Task Stage</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#5E6C84] hover:text-[#172B4D] hover:bg-[#EBECF0] p-1 rounded-[3px] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#FFBDAD]/20 border border-[#FFBDAD] text-[#BF2600] rounded-[3px] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SELECT SOURCE STAGE */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
              1. Select Source Stage
            </label>
            <Select value={sourceStageId} onValueChange={(val) => setSourceStageId(val)}>
              <SelectTrigger className="w-full h-9 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D] focus:ring-1 focus:ring-[#0052CC]">
                <SelectValue placeholder="Select Source Stage" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE1E6] shadow-lg rounded-[3px]">
                {stages.map((stage: any) => (
                  <SelectItem key={stage.id} value={stage.id} className="text-xs hover:bg-[#DEEBFF] hover:text-[#0747A6]">
                    {stage.name} ({tasks.filter((t: any) => t.stageId === stage.id && !t.parentTaskId).length} tasks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* STEP 2: SELECT TASK */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
              2. Select Task to Move
            </label>
            {availableTasks.length === 0 ? (
              <div className="p-3 bg-[#F4F5F7] border border-[#DFE1E6] text-[#5E6C84] rounded-[3px] text-xs">
                No tasks available in <strong>{sourceStageObj?.name || "this stage"}</strong>.
              </div>
            ) : (
              <Select value={selectedTaskId} onValueChange={(val) => setSelectedTaskId(val)}>
                <SelectTrigger className="w-full h-9 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D] focus:ring-1 focus:ring-[#0052CC]">
                  <SelectValue placeholder="Select Task to Move" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#DFE1E6] shadow-lg rounded-[3px] max-h-56">
                  {availableTasks.map((t: any) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs hover:bg-[#DEEBFF] hover:text-[#0747A6]">
                      {t.issueKey ? `[${t.issueKey}] ` : ""}{t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* STEP 3: SELECT TARGET STAGE */}
          <div>
            <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
              3. Move to Target Stage
            </label>
            <Select value={targetStageId} onValueChange={(val) => setTargetStageId(val)}>
              <SelectTrigger className="w-full h-9 bg-[#FAFBFC] border-[#DFE1E6] rounded-[3px] text-xs text-[#172B4D] focus:ring-1 focus:ring-[#0052CC]">
                <SelectValue placeholder="Select Target Stage" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#DFE1E6] shadow-lg rounded-[3px]">
                {availableTargetStages.map((stage: any) => (
                  <SelectItem key={stage.id} value={stage.id} className="text-xs hover:bg-[#DEEBFF] hover:text-[#0747A6]">
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SUBTASK INFO BANNER */}
          {selectedTaskObj && (
            <div className="p-3 bg-[#DEEBFF]/40 border border-[#B3D4FF] rounded-[4px] flex items-start space-x-2.5">
              <Layers className="w-4 h-4 text-[#0747A6] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#0747A6]">
                <p className="font-semibold">
                  {selectedTaskObj.issueKey ? `[${selectedTaskObj.issueKey}] ` : ""}{selectedTaskObj.title}
                </p>
                <p className="text-[11px] text-[#42526E] mt-0.5">
                  {subtasksCount > 0
                    ? `Includes ${subtasksCount} subtask${subtasksCount > 1 ? "s" : ""}. All subtasks will be moved to '${targetStageObj?.name}'.`
                    : `No subtasks attached. Main task will be moved to '${targetStageObj?.name}'.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end space-x-2 px-5 py-3 border-t border-[#DFE1E6] bg-[#FAFBFC]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs h-8 text-[#42526E] hover:bg-[#EBECF0]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || !selectedTaskId || !targetStageId}
            onClick={handleMoveTask}
            className="text-xs h-8 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium px-4 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Moving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Move Task & Subtasks</span>
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
