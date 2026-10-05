"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Key, 
  Sparkles, 
  Terminal, 
  Cpu, 
  ShieldAlert, 
  HelpCircle,
  ExternalLink,
  Code2,
  CheckCircle2
} from "lucide-react";

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
  
  // MCP Guide state
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'cli'>('claude');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

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

  const handleCopyNewKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeKeyValue = createdKey || "YOUR_CADENCE_API_KEY";

  const getTabSnippet = () => {
    switch (activeTab) {
      case 'claude':
        return `{
  "mcpServers": {
    "cadence": {
      "command": "npx",
      "args": ["-y", "cadence-mcp"],
      "env": {
        "CADENCE_API_KEY": "${activeKeyValue}"
      }
    }
  }
}`;
      case 'cursor':
        return `// Add under Cursor Settings > Features > MCP Servers > "+ Add New MCP Server"
// Name: Cadence
// Type: command
// Command:

env CADENCE_API_KEY="${activeKeyValue}" npx -y cadence-mcp`;
      case 'cli':
        return `# Quick test via terminal / npx
CADENCE_API_KEY="${activeKeyValue}" npx -y cadence-mcp`;
    }
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getTabSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
      </div>
    );
  }

  return (
    <div className="flex-grow w-full px-4 md:px-8 py-10 flex flex-col bg-[#FAFBFC] overflow-y-auto h-full">
      {/* Page Header */}
      <div className="w-full mb-8 border-b border-[#DFE1E6] pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#5E6C84] mb-2">
          <span>Settings</span>
          <span>/</span>
          <span>Security & API</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#172B4D] tracking-tight flex items-center gap-2">
              <Key className="w-6 h-6 text-[#0052CC]" />
              API Keys & Personal Access Tokens
            </h1>
            <p className="mt-1 text-sm text-[#5E6C84]">
              Manage API tokens to authenticate with Cadence REST APIs and connect AI assistants via Model Context Protocol (MCP).
            </p>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Key Management (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Success Banner when a new key is created */}
          {createdKey && (
            <div className="bg-[#E3FCEF] border border-[#ABF5D1] rounded-[4px] p-5 shadow-sm transition-all animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006644] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#006644]">
                    API Key Created Successfully
                  </h3>
                  <p className="text-xs text-[#006644]/90 mt-1 mb-3">
                    Copy your key now. For security reasons, <strong>you won't be able to view it again</strong> after leaving this page!
                  </p>
                  <div className="flex items-center gap-2 bg-white/90 p-2 rounded-[3px] border border-[#ABF5D1]">
                    <code className="flex-1 font-mono text-xs text-[#172B4D] break-all select-all px-1">
                      {createdKey}
                    </code>
                    <Button 
                      onClick={handleCopyNewKey} 
                      size="sm" 
                      className="shrink-0 bg-[#006644] hover:bg-[#004D33] text-white h-8 text-xs font-medium rounded-[3px]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copy Token
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => setCreatedKey(null)} 
                      className="text-xs font-semibold text-[#006644] hover:underline"
                    >
                      I have stored it safely
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Key Card */}
          <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-sm p-6">
            <h2 className="text-base font-semibold text-[#172B4D] mb-1">
              Create New Access Token
            </h2>
            <p className="text-xs text-[#5E6C84] mb-4">
              Give your token a descriptive name (e.g. <em>Cursor MCP Server</em> or <em>CI/CD Integration</em>).
            </p>
            <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  id="keyName"
                  placeholder="e.g. Cursor MCP Integration"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-9 bg-white border-[#DFE1E6] text-sm text-[#172B4D] placeholder:text-[#6B778C] rounded-[3px] focus-visible:ring-2 focus-visible:ring-[#4C9AFF]"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!newKeyName.trim() || isSubmitting} 
                className="h-9 shrink-0 bg-[#0052CC] hover:bg-[#0747A6] text-white font-medium text-sm rounded-[3px] px-4"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Generate Token
              </Button>
            </form>
          </div>

          {/* Active Keys Table */}
          <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#5E6C84]">
                Active Tokens ({keys.length})
              </h2>
            </div>

            {keys.length === 0 ? (
              <div className="p-12 text-center">
                <Key className="w-10 h-10 text-[#C1C7D0] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#172B4D]">No active API keys</p>
                <p className="text-xs text-[#5E6C84] mt-1">
                  Generate a key above to authenticate your MCP server or custom scripts.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#DFE1E6]">
                {keys.map((key) => (
                  <div 
                    key={key.id} 
                    className="px-6 py-4 flex items-center justify-between hover:bg-[#FAFBFC] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#172B4D]">
                          {key.name}
                        </span>
                        <span className="bg-[#EAE6FF] text-[#403294] text-[10px] font-bold px-2 py-0.5 rounded-[3px]">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-[#5E6C84]">
                        Created {new Date(key.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 text-xs font-medium text-[#DE350B] hover:text-[#BF2600] hover:bg-[#FFEBE6] rounded-[3px] px-3"
                        onClick={() => handleRevokeKey(key.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Refined Jira MCP Connect Guide (5 cols on lg) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#DFE1E6] rounded-[4px] shadow-sm overflow-hidden">
            {/* Guide Header */}
            <div className="p-6 border-b border-[#DFE1E6] bg-gradient-to-b from-[#FAFBFC] to-white">
              <div className="flex items-center gap-2 text-[#0052CC] mb-2">
                <Cpu className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Integration</span>
              </div>
              <h2 className="text-lg font-semibold text-[#172B4D]">
                Connect AI Tools (MCP)
              </h2>
              <p className="text-xs text-[#5E6C84] mt-1 leading-relaxed">
                Cadence implements the <strong>Model Context Protocol (MCP)</strong>. Connect your AI coding assistant (Cursor, Claude, Windsurf) directly to your tasks & workspace.
              </p>
            </div>

            {/* Guide Body */}
            <div className="p-6 space-y-6">
              {/* Tool Selector Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5E6C84] mb-2">
                  Select Your Environment
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#F4F5F7] p-1 rounded-[4px] border border-[#DFE1E6]">
                  <button
                    onClick={() => setActiveTab('claude')}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-[3px] transition-all ${
                      activeTab === 'claude'
                        ? 'bg-white text-[#0052CC] shadow-sm'
                        : 'text-[#5E6C84] hover:text-[#172B4D]'
                    }`}
                  >
                    Claude Desktop
                  </button>
                  <button
                    onClick={() => setActiveTab('cursor')}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-[3px] transition-all ${
                      activeTab === 'cursor'
                        ? 'bg-white text-[#0052CC] shadow-sm'
                        : 'text-[#5E6C84] hover:text-[#172B4D]'
                    }`}
                  >
                    Cursor IDE
                  </button>
                  <button
                    onClick={() => setActiveTab('cli')}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-[3px] transition-all ${
                      activeTab === 'cli'
                        ? 'bg-white text-[#0052CC] shadow-sm'
                        : 'text-[#5E6C84] hover:text-[#172B4D]'
                    }`}
                  >
                    Windsurf / CLI
                  </button>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-4 text-xs text-[#172B4D]">
                {activeTab === 'claude' && (
                  <ol className="space-y-3 list-decimal list-inside text-[#5E6C84]">
                    <li>
                      Open <strong className="text-[#172B4D]">Claude Desktop</strong> &gt; Settings &gt; Developer.
                    </li>
                    <li>
                      Click <strong className="text-[#172B4D]">Edit Config</strong> to open <code>claude_desktop_config.json</code>.
                    </li>
                    <li>
                      Add the snippet below into your <code>mcpServers</code> section:
                    </li>
                  </ol>
                )}

                {activeTab === 'cursor' && (
                  <ol className="space-y-3 list-decimal list-inside text-[#5E6C84]">
                    <li>
                      Open <strong className="text-[#172B4D]">Cursor Settings</strong> &gt; Features &gt; MCP Servers.
                    </li>
                    <li>
                      Click <strong className="text-[#172B4D]">"+ Add New MCP Server"</strong>.
                    </li>
                    <li>
                      Name it <strong className="text-[#172B4D]">Cadence</strong>, set Type to <strong className="text-[#172B4D]">command</strong>, and paste the command snippet below.
                    </li>
                  </ol>
                )}

                {activeTab === 'cli' && (
                  <ol className="space-y-3 list-decimal list-inside text-[#5E6C84]">
                    <li>
                      Execute the MCP server directly using <code>npx</code> or add it to your tool's MCP config.
                    </li>
                    <li>
                      Ensure <code>CADENCE_API_KEY</code> environment variable is exported.
                    </li>
                  </ol>
                )}

                {/* Snippet Card */}
                <div className="relative bg-[#091E42] rounded-[4px] border border-[#091E42] p-3 text-slate-200 font-mono text-[11px] group">
                  <button
                    onClick={handleCopySnippet}
                    className="absolute top-2 right-2 flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-[3px] text-[10px] font-medium transition-colors"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <pre className="overflow-x-auto whitespace-pre-wrap pr-16 leading-relaxed">
                    {getTabSnippet()}
                  </pre>
                </div>
              </div>

              {/* Jira Callout Box for Example Prompts */}
              <div className="bg-[#DEEBFF]/50 border-l-4 border-[#0052CC] p-4 rounded-r-[4px]">
                <div className="flex items-center gap-2 text-[#0052CC] font-semibold text-xs mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Try Asking Your AI Assistant</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[#172B4D]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#0052CC] font-bold">•</span>
                    <span>"List all my active Cadence projects and their status."</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#0052CC] font-bold">•</span>
                    <span>"Create a bug ticket in Cadence for missing validation."</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#0052CC] font-bold">•</span>
                    <span>"What tasks are currently assigned to me in Sprint 4?"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
