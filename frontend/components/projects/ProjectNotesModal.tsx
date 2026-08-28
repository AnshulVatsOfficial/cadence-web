"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { extractPlainText } from "@/lib/utils";
import {
  FileText,
  Search,
  Trash2,
  Calendar,
  User as UserIcon,
  Loader2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

interface ProjectNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function ProjectNotesModal({
  isOpen,
  onClose,
  projectId,
}: ProjectNotesModalProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<any | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchNotes();
    }
  }, [isOpen, projectId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/notes`);
      const fetchedNotes = res.data || [];
      setNotes(fetchedNotes);
      if (fetchedNotes.length > 0) {
        setSelectedNote(fetchedNotes[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error("Error fetching project notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteNote = async () => {
    if (!noteToDelete) return;

    setIsDeletingNote(true);
    try {
      await api.delete(`/projects/${projectId}/notes/${noteToDelete.id}`);
      const updated = notes.filter((n) => n.id !== noteToDelete.id);
      setNotes(updated);
      if (selectedNote?.id === noteToDelete.id) {
        setSelectedNote(updated[0] || null);
      }
      setNoteToDelete(null);
    } catch (err) {
      console.error("Error deleting note:", err);
    } finally {
      setIsDeletingNote(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = n.title.toLowerCase().includes(q);
    const contentMatch = extractPlainText(n.content).toLowerCase().includes(q);
    return titleMatch || contentMatch;
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-5xl w-full max-w-5xl h-[680px] max-h-[90vh] p-0 flex flex-col overflow-hidden bg-white border border-[#DFE1E6] rounded-lg shadow-2xl">
          {/* Header Bar */}
          <DialogHeader className="p-4 px-6 pr-12 border-b border-[#DFE1E6] flex flex-row items-center justify-between bg-[#FAFBFC] space-y-0 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-[4px] bg-[#0052CC]/10 text-[#0052CC] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-[#172B4D]">
                  Project Notes & Documentation
                </DialogTitle>
                <p className="text-xs text-[#5E6C84]">
                  Architecture guides, specs, and notes generated manually or by Cadence AI
                </p>
              </div>
            </div>

            <div className="relative w-64 flex-shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#5E6C84]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-8 h-8 text-xs bg-white border-[#DFE1E6] rounded-[3px] focus-visible:ring-1 focus-visible:ring-[#0052CC]"
              />
            </div>
          </DialogHeader>

          {/* Body Content Layout */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Notes Sidebar List */}
            <div className="w-80 flex-shrink-0 border-r border-[#DFE1E6] bg-[#FAFBFC] overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#5E6C84]">
                  <Loader2 className="w-5 h-5 animate-spin mb-2 text-[#0052CC]" />
                  <span className="text-xs">Loading notes...</span>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                  <BookOpen className="w-8 h-8 text-[#A5ADBA] mb-2" />
                  <p className="text-xs font-semibold text-[#172B4D]">
                    No project notes found
                  </p>
                  <p className="text-[11px] text-[#5E6C84] mt-1">
                    Ask Cadence AI e.g. <span className="font-semibold text-[#0052CC]">"Create a note titled Redis Setup"</span>
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = selectedNote?.id === note.id;
                  const snippet = extractPlainText(note.content).slice(0, 90);

                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-3 rounded-[4px] border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#DEEBFF] border-[#B3D4FF] shadow-sm"
                          : "bg-white border-[#DFE1E6] hover:border-[#C1C7D0] hover:bg-[#F4F5F7]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className={`text-xs font-bold truncate pr-2 ${isSelected ? "text-[#0747A6]" : "text-[#172B4D]"}`}>
                          {note.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(note);
                          }}
                          className="text-[#6B778C] hover:text-[#DE350B] p-0.5 rounded transition-colors flex-shrink-0"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-[#5E6C84] line-clamp-2 mt-1.5 leading-relaxed">
                        {snippet || "No additional content."}
                      </p>

                      <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-[#DFE1E6]/60 text-[10px] text-[#6B778C]">
                        <span className="flex items-center space-x-1 truncate">
                          <UserIcon className="w-3 h-3 text-[#0052CC]" />
                          <span className="truncate">{note.user?.name || note.user?.email || "Cadence User"}</span>
                        </span>
                        <span className="flex items-center space-x-1 flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Note Main View */}
            <div className="flex-1 bg-white p-6 overflow-y-auto min-w-0">
              {selectedNote ? (
                <div className="w-full space-y-4">
                  <div className="border-b border-[#DFE1E6] pb-4">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#0052CC] mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                      <span>Project Documentation</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#172B4D] break-words">
                      {selectedNote.title}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-[#5E6C84]">
                      <span>Author: <strong className="text-[#172B4D]">{selectedNote.user?.name || selectedNote.user?.email || "Cadence User"}</strong></span>
                      <span>•</span>
                      <span>Last Updated: <strong className="text-[#172B4D]">{new Date(selectedNote.updatedAt).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <MarkdownRenderer content={extractPlainText(selectedNote.content)} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#5E6C84]">
                  <BookOpen className="w-12 h-12 text-[#DFE1E6] mb-3" />
                  <p className="text-sm font-semibold text-[#172B4D]">Select a project note to read</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        title="Delete Project Note?"
        description={
          <span>
            Are you sure you want to delete <strong className="text-[#172B4D]">"{noteToDelete?.title}"</strong>? This action cannot be undone.
          </span>
        }
        confirmText="Delete Note"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingNote}
        onConfirm={executeDeleteNote}
      />
    </>
  );
}
