"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Copy, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api-keys");
      setKeys(res.data);
    } catch (err) {
      console.error("Failed to fetch API keys", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    try {
      setIsSubmitting(true);
      const res = await api.post("/api-keys", { name: newKeyName });
      setCreatedKey(res.data.key);
      setNewKeyName("");
      fetchKeys(); // Refresh list
    } catch (err) {
      console.error("Failed to create API key", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this key? Any application using it will stop working immediately.")) return;
    
    try {
      await api.delete(`/api-keys/${id}`);
      fetchKeys(); // Refresh list
    } catch (err) {
      console.error("Failed to revoke API key", err);
    }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <>
        <div className="max-w-4xl mx-auto p-6 space-y-8 flex-1 w-full overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-[#172B4D]">API Keys (Personal Access Tokens)</h1>
            <p className="mt-2 text-[#5E6C84]">
              Manage your personal access tokens. These tokens can be used to authenticate with the Cadence API and MCP Server.
            </p>
          </div>

          {createdKey && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <h3 className="text-green-800 font-semibold">New API Key Created</h3>
              <p className="text-green-700 text-sm mt-1 mb-3">
                Please copy this key now. For your security, you won't be able to see it again!
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-white p-2 rounded border border-green-100 font-mono text-sm break-all">
                  {createdKey}
                </code>
                <Button onClick={handleCopy} variant="outline" className="shrink-0 border-green-200 hover:bg-green-100">
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setCreatedKey(null)} className="text-green-700">
                  I have saved it
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#172B4D] mb-4">Create New Key</h2>
            <form onSubmit={handleCreateKey} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="keyName" className="block text-sm font-medium text-[#172B4D] mb-1">
                  Key Name
                </label>
                <Input
                  id="keyName"
                  placeholder="e.g. Claude MCP Integration"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white border-[#DFE1E6] rounded-[3px] focus-visible:ring-[#0052CC]"
                />
              </div>
              <Button type="submit" disabled={!newKeyName.trim() || isSubmitting} className="shrink-0 bg-[#0052CC] hover:bg-[#0747A6] rounded-[3px] text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Generate Key
              </Button>
            </form>
          </div>

          <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-sm">
            <div className="px-6 py-4 border-b border-[#DFE1E6]">
              <h2 className="text-lg font-semibold text-[#172B4D]">Active Keys</h2>
            </div>
            
            <div className="divide-y divide-[#DFE1E6]">
              {keys.length === 0 ? (
                <div className="p-6 text-center text-[#5E6C84]">
                  You haven't generated any API keys yet.
                </div>
              ) : (
                keys.map((key) => (
                  <div key={key.id} className="p-6 flex items-center justify-between hover:bg-[#FAFBFC]">
                    <div>
                      <h3 className="font-semibold text-[#172B4D]">{key.name}</h3>
                      <p className="text-sm text-[#5E6C84] mt-1">
                        Created on {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-[3px]"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </>
  );
}
