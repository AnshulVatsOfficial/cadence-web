"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useProject } from "./ProjectContext";
import { Loader2 } from "lucide-react";

interface GeneratedTask {
  title: string;
  description: string;
  issueType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes: number;
  tags?: string[];
  subtasks?: GeneratedTask[];
}

export function AIGeneratorModal({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { projectDetails, fetchProjectDetails } = useProject();
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<(GeneratedTask & { selected: boolean })[]>([]);
  const [step, setStep] = useState<"input" | "review">("input");

  const handleGenerate = async () => {
    if (!projectDetails || brief.length < 10) return;
    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectDetails.id}/ai-generate`, { brief });
      setGeneratedTasks(res.data.map((t: any) => ({ ...t, selected: true })));
      setStep("review");
    } catch (error) {
      console.error(error);
      alert("Failed to generate tickets. Make sure the API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!projectDetails) return;
    setLoading(true);
    try {
      const selectedTasks = generatedTasks.filter(t => t.selected).map(t => ({
        title: t.title,
        description: t.description,
        issueType: t.issueType,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes,
        tags: t.tags,
        subtasks: t.subtasks
      }));

      await api.post(`/projects/${projectDetails.id}/tasks/bulk`, { tasks: selectedTasks });
      await fetchProjectDetails();
      onOpenChange(false);
      setStep("input");
      setBrief("");
      setGeneratedTasks([]);
    } catch (error) {
      console.error(error);
      alert("Failed to create tasks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) {
        setTimeout(() => {
          setStep("input");
          setBrief("");
        }, 200);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Tasks with AI ✨</DialogTitle>
        </DialogHeader>

        {step === "input" ? (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Paste your project brief, requirements, or client email below. AI will break it down into actionable Agile tickets.
            </p>
            <Textarea 
              placeholder="e.g. Build a secure login system with Google OAuth and forgot password flow..." 
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="min-h-[200px]"
            />
            <DialogFooter>
              <Button disabled={loading || brief.length < 10} onClick={handleGenerate}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Generating..." : "Generate Tickets"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4 overflow-hidden">
            <p className="text-sm text-muted-foreground">
              Review the generated tickets. Uncheck any you don't want to create.
            </p>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {generatedTasks.map((task, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 border rounded-md">
                  <Checkbox 
                    checked={task.selected} 
                    onCheckedChange={(c) => {
                      const updated = [...generatedTasks];
                      updated[idx].selected = !!c;
                      setGeneratedTasks(updated);
                    }} 
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#EAE6FF] text-[#403294] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-muted px-2 py-1 rounded">{task.issueType}</span>
                      <span className="bg-muted px-2 py-1 rounded">{task.priority}</span>
                      {task.estimatedMinutes && <span className="bg-muted px-2 py-1 rounded">{task.estimatedMinutes} min</span>}
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Subtasks</p>
                        {task.subtasks.map((st, i) => (
                          <div key={i} className="text-xs bg-slate-50 p-2 rounded border">
                            <p className="font-semibold">{st.title}</p>
                            <div className="flex gap-2 mt-1 text-[10px]">
                              <span className="bg-slate-200 px-1.5 py-0.5 rounded">{st.issueType}</span>
                              <span className="bg-slate-200 px-1.5 py-0.5 rounded">{st.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("input")}>Back</Button>
              <Button disabled={loading || generatedTasks.filter(t => t.selected).length === 0} onClick={handleCreate}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : `Create ${generatedTasks.filter(t => t.selected).length} Tasks`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
