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
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor'>('claude');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const configJson = `{
  "mcpServers": {
    "cadence": {
      "command": "npx",
      "args": ["-y", "cadence-mcp"],
      "env": {
        "CADENCE_API_KEY": "YOUR_KEY_HERE"
      }
    }
  }
}`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(configJson);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

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
    <div className="p-6 flex flex-col lg:flex-row justify-between gap-12 flex-1 w-full h-full overflow-y-auto">
      {/* Left Column: Key Management */}
      <div className="flex-1 space-y-8 max-w-4xl">
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
                placeholder="e.g. Cursor MCP Integration"
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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-[#5E6C84] hover:text-[#172B4D] rounded-[3px]"
                      onClick={() => {
                        // We copy a placeholder because real keys are hashed in DB
                        navigator.clipboard.writeText(`cadence_ak_... [Hidden for Security]`);
                        alert("For security reasons, API keys are hashed and cannot be viewed again. Please revoke and create a new one if you lost it!");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-[3px]"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Guide Sidebar */}
      <div className="w-full lg:w-[450px] shrink-0">
        <div className="bg-[#DEEBFF] border border-[#B3D4FF] rounded-[4px] p-6 sticky top-6 shadow-sm">
          <h3 className="font-bold text-[#172B4D] text-lg lg:text-xl mb-6">Connecting AI Services</h3>
          
          <div className="space-y-6">
            
            {/* Step 1: Explain MCP */}
            <div>
              <h4 className="font-semibold text-[#172B4D] text-sm lg:text-base mb-2">1. What is MCP?</h4>
              <p className="text-sm text-[#5E6C84] leading-relaxed">
                Cadence supports the universal <strong>Model Context Protocol (MCP)</strong>. This allows you to securely connect any modern AI Code Editor (like Cursor or Windsurf) or AI Assistant (like Claude Desktop) directly to your workspace. The AI can read your projects and automate tasks for you!
              </p>
            </div>

            {/* Step 2: How to Connect */}
            <div className="border-t border-[#B3D4FF] pt-5">
              <h4 className="font-semibold text-[#172B4D] text-sm lg:text-base mb-2">2. How to Connect</h4>
              <p className="text-sm text-[#5E6C84] leading-relaxed">
                First, generate and copy your API Key from the left panel. Depending on your AI tool, you can connect it by editing its JSON config file or by using its built-in Settings UI.
              </p>
            </div>

            {/* Step 3: JSON Config */}
            <div className="border-t border-[#B3D4FF] pt-5">
              <h4 className="font-semibold text-[#172B4D] text-sm lg:text-base mb-2">3. Method A: JSON Config</h4>
              <p className="text-sm text-[#5E6C84] mb-3 leading-relaxed">
                For tools like Claude Desktop (<strong>Settings &gt; Developer &gt; Edit Config</strong>) or Cursor (via <code>~/.cursor/mcp.json</code>). Paste the block below into your tool's MCP configuration file. <em>Don't forget to replace YOUR_KEY_HERE!</em>
              </p>
              <div className="bg-[#172B4D] rounded-[4px] p-4 relative shadow-inner group">
                <Button 
                  onClick={handleCopyConfig} 
                  variant="outline" 
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  {copiedConfig ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedConfig ? "Copied" : "Copy"}
                </Button>
                <pre className="text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre pt-4 pb-2">
{configJson}
                </pre>
              </div>
            </div>

            {/* Step 4: UI Command */}
            <div className="border-t border-[#B3D4FF] pt-5">
              <h4 className="font-semibold text-[#172B4D] text-sm lg:text-base mb-2">4. Method B: Settings UI</h4>
              <p className="text-sm text-[#5E6C84] mb-3 leading-relaxed">
                If your AI Editor has an MCP Settings UI (e.g., Cursor: <strong>Settings &gt; Features &gt; MCP Servers</strong>), click <strong>+ Add New MCP Server</strong>. Choose type <code>command</code>, name it <code>Cadence</code>, and paste this exact command (replace YOUR_KEY_HERE):
              </p>
              <div className="bg-[#172B4D] rounded-[4px] p-4 relative shadow-inner group">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText('env CADENCE_API_KEY="YOUR_KEY_HERE" npx -y cadence-mcp');
                    setCopiedCmd(true);
                    setTimeout(() => setCopiedCmd(false), 2000);
                  }} 
                  variant="outline" 
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedCmd ? "Copied" : "Copy"}
                </Button>
                <pre className="text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre pt-4 pb-2">
env CADENCE_API_KEY="YOUR_KEY_HERE" npx -y cadence-mcp
                </pre>
              </div>
            </div>

            {/* Step 5: Start Chatting */}
            <div className="border-t border-[#B3D4FF] pt-5">
              <h4 className="font-semibold text-[#172B4D] text-sm lg:text-base mb-2">5. Start Chatting!</h4>
              <p className="text-sm text-[#5E6C84] mb-3 leading-relaxed">
                Once connected, the AI will be able to read and manage your Cadence projects directly in real-time. Try opening your AI chat (e.g., Cmd+L in Cursor) and asking things like:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-[#172B4D] italic">
                <li>"What are my active projects in Cadence?"</li>
                <li>"Create a new task in Cadence for the checkout bug."</li>
                <li>"List all tasks assigned to me."</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
