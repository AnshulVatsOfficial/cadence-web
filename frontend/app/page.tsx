"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";
import Link from "next/link";
import {
  KanbanSquare,
  Layers,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Users,
  Compass,
  Zap,
  ArrowRight,
  PlayCircle,
  GitBranch,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  // State for interactive tab selector
  const [activeTab, setActiveTab] = useState<"dev" | "product" | "design">("dev");

  const getInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "US";
  };

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-ds-bg-neutral transition-colors outline-none focus:ring-2 focus:ring-brand">
          <div className="w-8 h-8 rounded-full bg-brand text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {getInitials(user?.name, user?.email)}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-[#DFE1E6] shadow-md rounded-[3px]" align="end">
        <div className="px-3 py-2 border-b border-[#DFE1E6]">
          <p className="text-xs font-bold text-[#172B4D] truncate">
            {user?.name || "User"}
          </p>
          <p className="text-[11px] text-[#5E6C84] truncate">{user?.email}</p>
        </div>
        <DropdownMenuItem
          onClick={logout}
          className="text-xs text-red-600 font-semibold px-3 py-2 cursor-pointer hover:bg-red-50 flex items-center space-x-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-[#172B4D]">
      
      {/* ── 1. STICKY HEADER ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 md:px-12 bg-white/95 backdrop-blur-sm border-b border-[#DFE1E6] h-[72px] sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-2.5 text-[#0052CC] font-bold text-lg tracking-tight select-none">
            <div className="w-8 h-8 bg-[#0052CC] rounded-[3px] flex items-center justify-center font-bold text-white text-base shadow-sm">
              C
            </div>
            <span className="text-[#172B4D] font-extrabold uppercase tracking-wide text-sm md:text-base">
              Cadence
            </span>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-[#5E6C84]">
            <span className="hover:text-[#0052CC] cursor-pointer transition-colors">Features</span>
            <span className="hover:text-[#0052CC] cursor-pointer transition-colors">Solutions</span>
            <span className="hover:text-[#0052CC] cursor-pointer transition-colors">Templates</span>
            <span className="hover:text-[#0052CC] cursor-pointer transition-colors">Pricing</span>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-[#5E6C84] hover:text-[#172B4D] transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs px-4 py-2.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-bold rounded-[3px] transition-colors shadow-sm"
              >
                Get Cadence free
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/projects"
                className="text-xs font-bold text-[#0052CC] hover:text-[#0747A6] transition-colors mr-2 flex items-center"
              >
                <span>Go to project</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
              <UserDropdown />
            </>
          )}
        </div>
      </header>

      {/* ── 2. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="w-full flex flex-col items-center pt-20 pb-16 px-6 md:px-12 relative overflow-hidden bg-gradient-to-b from-[#F4F5F7]/50 via-white to-white">
        {/* Soft backdrop blur lights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#DEEBFF] opacity-30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#EAE6FF] opacity-30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-[#DEEBFF] text-[#0052CC] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#0052CC]" />
            <span>Introducing Projects 2.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#172B4D] leading-[1.1] mb-6">
            The software tracker built for <span className="text-[#0052CC]">high-velocity teams</span>
          </h1>

          <p className="max-w-2xl text-sm md:text-base text-[#5E6C84] leading-relaxed mb-8">
            Plan sprints, track task boards, and coordinate software releases. 
            Bring engineering, product management, and design together in isolated, secure projects.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-16">
            {isLoggedIn ? (
              <Link
                href="/projects"
                className="flex h-11 items-center justify-center px-8 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] transition"
              >
                Go to project
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex h-11 items-center justify-center px-8 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold rounded-[3px] transition"
                >
                  Start free trial
                </Link>
                <Link
                  href="/login"
                  className="flex h-11 items-center justify-center px-8 border border-[#DFE1E6] hover:bg-[#FAFBFC] bg-white text-xs font-bold rounded-[3px] text-[#172B4D] transition"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── 3. HERO MOCKUP GRAPHIC ──────────────────────────────────────── */}
        <div className="w-full max-w-5xl bg-white border border-[#DFE1E6] rounded-[6px] shadow-2xl overflow-hidden flex flex-col relative group transition-all duration-300 hover:border-[#0052CC]">
          {/* Header controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FAFBFC] border-b border-[#DFE1E6]">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-[#FF5630]"></span>
              <span className="h-3 w-3 rounded-full bg-[#FFAB00]"></span>
              <span className="h-3 w-3 rounded-full bg-[#36B37E]"></span>
              <span className="text-[10px] text-[#5E6C84] pl-2 font-mono select-none">
                cadence://projects/engineering-sprint-board
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-2 bg-[#EBECF0] rounded-[2px]"></span>
              <span className="w-4 h-2 bg-[#EBECF0] rounded-[2px]"></span>
            </div>
          </div>

          {/* Render Mock Application Sidebar + Kanban Board */}
          <div className="flex min-h-[350px] bg-white">
            {/* Sidebar Mock */}
            <div className="w-48 border-r border-[#DFE1E6] bg-[#FAFBFC] p-3 hidden sm:flex flex-col space-y-4">
              <div className="flex items-center space-x-2 bg-[#DEEBFF] p-1.5 rounded-[3px] border border-[#DEEBFF]">
                <div className="w-5 h-5 bg-[#0052CC] rounded-[2px] flex items-center justify-center font-bold text-white text-[9px]">E</div>
                <span className="text-[10px] font-bold truncate">Engineering Project</span>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-[#5E6C84] tracking-wider uppercase block px-1">Planning</span>
                <span className="text-[10px] bg-[#EBECF0] text-[#0747A6] font-bold p-1.5 rounded-[3px] flex items-center space-x-1.5 cursor-pointer">
                  <KanbanSquare className="w-3.5 h-3.5" />
                  <span>Sprint Board</span>
                </span>
                <span className="text-[10px] text-[#5E6C84] p-1.5 rounded-[3px] flex items-center space-x-1.5 hover:bg-[#EBECF0]/50 cursor-pointer">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Backlog</span>
                </span>
              </div>
            </div>

            {/* Main Area Mock */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-[#DFE1E6] flex items-center justify-between bg-[#FAFBFC]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#172B4D]">Projects</span>
                  <span className="text-[#5E6C84] text-xs">/</span>
                  <span className="text-xs font-semibold text-[#0052CC]">Sprint Board</span>
                </div>
                <span className="text-[10px] bg-[#E2F0D9] text-[#2A5913] px-2 py-0.5 rounded font-mono font-bold">Synced</span>
              </div>

              {/* Kanban Mock Grid */}
              <div className="p-4 grid grid-cols-3 gap-4 overflow-x-auto min-w-[500px] flex-1">
                {/* Column A */}
                <div className="bg-[#F4F5F7] border border-[#DFE1E6] rounded-[4px] p-2 space-y-2 flex flex-col justify-start">
                  <span className="text-[9px] font-bold text-[#5E6C84] tracking-wider uppercase px-1">TO DO</span>
                  <div className="bg-white border border-[#DFE1E6] p-2.5 rounded-[3px] shadow-sm space-y-2">
                    <h5 className="text-[10px] font-bold text-[#172B4D]">Setup CI/CD deployment logic</h5>
                    <div className="flex items-center justify-between text-[8px] text-[#5E6C84]">
                      <span className="font-bold text-[#0052CC]">CAD-104</span>
                      <span className="bg-[#DEEBFF] text-[#0052CC] font-bold px-1 rounded">JD</span>
                    </div>
                  </div>
                  <div className="bg-white border border-[#DFE1E6] p-2.5 rounded-[3px] shadow-sm space-y-2">
                    <h5 className="text-[10px] font-bold text-[#172B4D]">Add transactional cascading</h5>
                    <div className="flex items-center justify-between text-[8px] text-[#5E6C84]">
                      <span className="font-bold text-[#0052CC]">CAD-105</span>
                      <span className="bg-[#DEEBFF] text-[#0052CC] font-bold px-1 rounded">AV</span>
                    </div>
                  </div>
                </div>

                {/* Column B */}
                <div className="bg-[#DEEBFF]/30 border border-[#DEEBFF] rounded-[4px] p-2 space-y-2 flex flex-col justify-start">
                  <span className="text-[9px] font-bold text-[#0747A6] tracking-wider uppercase px-1">IN PROGRESS</span>
                  <div className="bg-white border border-[#B3D4FF] p-2.5 rounded-[3px] shadow-sm space-y-2">
                    <h5 className="text-[10px] font-bold text-[#172B4D]">Refactor navbar responsive layouts</h5>
                    <div className="flex items-center justify-between text-[8px] text-[#5E6C84]">
                      <span className="font-bold text-[#0747A6]">CAD-106</span>
                      <span className="bg-[#EAE6FF] text-[#403294] font-bold px-1 rounded">JD</span>
                    </div>
                  </div>
                </div>

                {/* Column C */}
                <div className="bg-[#E2F0D9]/30 border border-[#E2F0D9] rounded-[4px] p-2 space-y-2 flex flex-col justify-start">
                  <span className="text-[9px] font-bold text-[#2A5913] tracking-wider uppercase px-1">DONE</span>
                  <div className="bg-white border border-[#DFE1E6] p-2.5 rounded-[3px] shadow-sm space-y-2 opacity-75">
                    <h5 className="text-[10px] font-bold text-[#172B4D] line-through">Establish database syncs</h5>
                    <div className="flex items-center justify-between text-[8px] text-[#5E6C84]">
                      <span className="font-bold">CAD-100</span>
                      <span className="bg-[#EAE6FF] text-[#403294] font-bold px-1 rounded">AV</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SOCIAL PROOF / LOGO WALL ──────────────────────────────────── */}
      <section className="border-y border-[#DFE1E6] bg-[#FAFBFC] py-8 text-center px-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5E6C84] mb-4">
          Trusted by high-growth software engineering organizations
        </p>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-65 grayscale select-none">
          <span className="text-sm font-black tracking-tighter text-[#172B4D]">ACME CORP</span>
          <span className="text-sm font-black tracking-tighter text-[#172B4D]">GLOBEX</span>
          <span className="text-sm font-black tracking-tighter text-[#172B4D]">INITECH SOLUTIONS</span>
          <span className="text-sm font-black tracking-tighter text-[#172B4D]">HOOLI SYSTEMS</span>
          <span className="text-sm font-black tracking-tighter text-[#172B4D]">VEHEMENT</span>
        </div>
      </section>

      {/* ── 5. INTERACTIVE WORKFLOW SHOWCASE (JIRA INSPIRED) ──────────────── */}
      <section className="py-24 bg-white flex justify-center px-6">
        <div className="max-w-5xl w-full flex flex-col items-center">
          <div className="text-center max-w-2xl mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#172B4D] tracking-tight">
              One collaborative tracker. Infinite ways to plan.
            </h2>
            <p className="text-xs md:text-sm text-[#5E6C84] mt-2.5 leading-relaxed">
              Select your department to see how Cadence matches your specific delivery workflow.
            </p>
          </div>

          {/* Interactive tab headers */}
          <div className="flex bg-[#F4F5F7] p-1 rounded-[4px] border border-[#DFE1E6] mb-8 space-x-1">
            <button
              onClick={() => setActiveTab("dev")}
              className={`px-4 py-2 text-xs font-bold rounded-[3px] transition ${
                activeTab === "dev" ? "bg-white text-[#0052CC] shadow-sm" : "text-[#5E6C84] hover:text-[#172B4D]"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 inline mr-1.5" />
              Software Development
            </button>
            <button
              onClick={() => setActiveTab("product")}
              className={`px-4 py-2 text-xs font-bold rounded-[3px] transition ${
                activeTab === "product" ? "bg-white text-[#0052CC] shadow-sm" : "text-[#5E6C84] hover:text-[#172B4D]"
              }`}
            >
              <Compass className="w-3.5 h-3.5 inline mr-1.5" />
              Product Management
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`px-4 py-2 text-xs font-bold rounded-[3px] transition ${
                activeTab === "design" ? "bg-white text-[#0052CC] shadow-sm" : "text-[#5E6C84] hover:text-[#172B4D]"
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1.5" />
              Design & Marketing
            </button>
          </div>

          {/* Tab Contents */}
          <div className="border border-[#DFE1E6] rounded-[4px] p-6 md:p-8 bg-[#FAFBFC] w-full flex flex-col md:flex-row items-center gap-8 min-h-[300px]">
            {activeTab === "dev" && (
              <>
                <div className="flex-1 space-y-4">
                  <span className="text-[9px] font-bold bg-[#E2F0D9] text-[#2A5913] px-2 py-0.5 rounded-full uppercase tracking-wider">Agile & Scrum</span>
                  <h3 className="text-xl font-bold text-[#172B4D] tracking-tight">Accelerate delivery loops</h3>
                  <p className="text-xs text-[#5E6C84] leading-relaxed">
                    Break down complex systems into clean tasks. Mapped directly onto customizable board structures, engineers can drag, drop, and complete tasks with live database feedback.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-[#172B4D]">
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#36B37E] mr-2" /> Real-time sprint boards</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#36B37E] mr-2" /> Task dependencies</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#36B37E] mr-2" /> Transactional data safety</li>
                  </ul>
                </div>
                <div className="flex-1 w-full flex justify-center bg-white border border-[#DFE1E6] p-4 rounded shadow-sm">
                  <div className="w-full space-y-3">
                    <span className="text-[10px] text-[#5E6C84] font-bold block border-b border-[#F4F5F7] pb-1.5">ACTIVE BOARD</span>
                    <div className="bg-[#FAFBFC] border border-[#DFE1E6] p-2.5 rounded text-xs space-y-1">
                      <div className="font-bold text-[#172B4D]">CAD-112: Compile Docker deployment specs</div>
                      <div className="text-[10px] text-[#5E6C84]">Assigned to: Anshul Vats</div>
                    </div>
                    <div className="bg-[#DEEBFF] border border-[#B3D4FF] p-2.5 rounded text-xs space-y-1">
                      <div className="font-bold text-[#0747A6]">CAD-113: Refactor index cascade validations</div>
                      <div className="text-[10px] text-[#0747A6]">Assigned to: Anshul Vats</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "product" && (
              <>
                <div className="flex-1 space-y-4">
                  <span className="text-[9px] font-bold bg-[#DEEBFF] text-[#0747A6] px-2 py-0.5 rounded-full uppercase tracking-wider">Roadmapping</span>
                  <h3 className="text-xl font-bold text-[#172B4D] tracking-tight">Define goals & align priorities</h3>
                  <p className="text-xs text-[#5E6C84] leading-relaxed">
                    Plan long-term features, manage cross-functional project items, and define product milestones. Track backlog issues before allocating them to sprints.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-[#172B4D]">
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#0052CC] mr-2" /> Unified product backlogs</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#0052CC] mr-2" /> Priority categorizations</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#0052CC] mr-2" /> Isolated projects</li>
                  </ul>
                </div>
                <div className="flex-1 w-full flex justify-center bg-white border border-[#DFE1E6] p-4 rounded shadow-sm">
                  <div className="w-full space-y-3">
                    <span className="text-[10px] text-[#5E6C84] font-bold block border-b border-[#F4F5F7] pb-1.5">PRODUCT TIMELINE</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#172B4D]">Milestone: Q3 Release</span>
                        <span className="text-[10px] text-green-700 bg-green-50 px-1.5 rounded font-bold">On track</span>
                      </div>
                      <div className="w-full bg-[#FAFBFC] h-3.5 border border-[#DFE1E6] rounded-full overflow-hidden">
                        <div className="w-3/4 bg-[#0052CC] h-full"></div>
                      </div>
                      <span className="text-[10px] text-[#5E6C84] block">75% of milestone issues completed.</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "design" && (
              <>
                <div className="flex-1 space-y-4">
                  <span className="text-[9px] font-bold bg-[#EAE6FF] text-[#403294] px-2 py-0.5 rounded-full uppercase tracking-wider">Creatives</span>
                  <h3 className="text-xl font-bold text-[#172B4D] tracking-tight">Streamline assets reviews</h3>
                  <p className="text-xs text-[#5E6C84] leading-relaxed">
                    Collaborate on user experience updates, review interface mockups, and track design hand-offs. Keep copy assets and creative items organized in separate project buckets.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-[#172B4D]">
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#403294] mr-2" /> Asset tags and categories</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#403294] mr-2" /> Creative feedback boards</li>
                    <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-[#403294] mr-2" /> Smooth project hand-offs</li>
                  </ul>
                </div>
                <div className="flex-1 w-full flex justify-center bg-white border border-[#DFE1E6] p-4 rounded shadow-sm">
                  <div className="w-full space-y-3">
                    <span className="text-[10px] text-[#5E6C84] font-bold block border-b border-[#F4F5F7] pb-1.5">CREATIVE DESIGN FLOW</span>
                    <div className="bg-[#EAE6FF]/35 border border-[#EAE6FF] p-2.5 rounded text-xs space-y-1">
                      <div className="font-bold text-[#403294]">CAD-156: Deliver Figma dashboard components</div>
                      <div className="text-[10px] text-[#403294]">Status: Feedback review</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 6. FEATURE FOCUS GRID ────────────────────────────────────────── */}
      <section className="py-24 bg-[#FAFBFC] border-t border-[#DFE1E6] flex justify-center px-6">
        <div className="max-w-5xl w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#172B4D] tracking-tight">
              Configured with software best practices
            </h2>
            <p className="text-xs md:text-sm text-[#5E6C84] mt-2.5 leading-relaxed">
              Every detail of Cadence is structured around high reliability, simple usage, and isolated workspace management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="bg-white border border-[#DFE1E6] p-6 rounded-[4px] shadow-sm flex flex-col space-y-4 hover:border-[#0052CC] hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-[#DEEBFF] text-[#0052CC] rounded-full flex items-center justify-center">
                <KanbanSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Kanban Boards</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Drag-and-drop workflow statuses, prioritize task items, and manage sprints inside a fast, client-rendered layout.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-white border border-[#DFE1E6] p-6 rounded-[4px] shadow-sm flex flex-col space-y-4 hover:border-[#0052CC] hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-[#EAE6FF] text-[#403294] rounded-full flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Project Isolation</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Keep project teams separate. Members and invitations are bounded to projects, keeping projects strictly isolated.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-white border border-[#DFE1E6] p-6 rounded-[4px] shadow-sm flex flex-col space-y-4 hover:border-[#0052CC] hover:shadow-md transition-all duration-300">
              <div className="w-10 h-10 bg-[#E2F0D9] text-[#2A5913] rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#172B4D]">Identity & SSO</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Integrated Clerk authentication routes ensure secure identity verification, auto-syncing profiles to databases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. STATS BLOCK ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-[#DFE1E6] flex justify-center px-6">
        <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#0052CC]">+324%</div>
            <div className="text-xs text-[#5E6C84] font-bold uppercase tracking-wider mt-2">Team Throughput</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#0052CC]">14 Days</div>
            <div className="text-xs text-[#5E6C84] font-bold uppercase tracking-wider mt-2">Average Sprint Cycle</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#0052CC]">99.9%</div>
            <div className="text-xs text-[#5E6C84] font-bold uppercase tracking-wider mt-2">Database Uptime</div>
          </div>
        </div>
      </section>

      {/* ── 8. CALL TO ACTION BLOCK ───────────────────────────────────────── */}
      <section className="bg-[#0747A6] text-white py-20 px-6 text-center flex flex-col items-center relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0052CC]/50 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4 text-white">
            Start organizing your sprints with Cadence today
          </h2>
          <p className="text-xs md:text-sm text-blue-100 leading-relaxed mb-8 max-w-lg mx-auto">
            Free forever for up to 10 team members. Unlimited projects, sprint boards, and project logs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
            {isLoggedIn ? (
              <Link
                href="/projects"
                className="bg-white hover:bg-gray-100 text-[#0052CC] text-xs font-bold px-8 py-3 rounded-[3px] shadow transition-colors flex items-center justify-center"
              >
                <span>Go to project</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-white hover:bg-gray-100 text-[#0052CC] text-xs font-bold px-8 py-3 rounded-[3px] shadow transition-colors flex items-center justify-center"
                >
                  <span>Sign up for free</span>
                </Link>
                <Link
                  href="/login"
                  className="bg-[#0052CC] hover:bg-[#0747A6] border border-[#DEEBFF]/30 text-white text-xs font-bold px-8 py-3 rounded-[3px] transition-colors flex items-center justify-center"
                >
                  <span>Log in to your account</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 9. FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#DFE1E6] py-16 px-6 md:px-12 text-xs text-[#5E6C84]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172B4D] uppercase tracking-wider text-[10px]">Product</h4>
            <ul className="space-y-2">
              <li className="hover:underline cursor-pointer">Kanban Boards</li>
              <li className="hover:underline cursor-pointer">Projects</li>
              <li className="hover:underline cursor-pointer">SSO Integration</li>
              <li className="hover:underline cursor-pointer">Roadmaps</li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172B4D] uppercase tracking-wider text-[10px]">Solutions</h4>
            <ul className="space-y-2">
              <li className="hover:underline cursor-pointer">Agile Teams</li>
              <li className="hover:underline cursor-pointer">DevOps</li>
              <li className="hover:underline cursor-pointer">Product Managers</li>
              <li className="hover:underline cursor-pointer">Design Review</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172B4D] uppercase tracking-wider text-[10px]">Resources</h4>
            <ul className="space-y-2">
              <li className="hover:underline cursor-pointer">Developer Docs</li>
              <li className="hover:underline cursor-pointer">Support Channel</li>
              <li className="hover:underline cursor-pointer">Platform Status</li>
              <li className="hover:underline cursor-pointer">Security Portal</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#172B4D] uppercase tracking-wider text-[10px]">Company</h4>
            <ul className="space-y-2">
              <li className="hover:underline cursor-pointer">About Cadence</li>
              <li className="hover:underline cursor-pointer">Platform Blog</li>
              <li className="hover:underline cursor-pointer">Uptime Monitor</li>
              <li className="hover:underline cursor-pointer">Contact Sales</li>
            </ul>
          </div>

        </div>

        <div className="max-w-5xl mx-auto border-t border-[#DFE1E6] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#172B4D]">
            <div className="w-5 h-5 bg-[#5E6C84] rounded-[2px] flex items-center justify-center text-[10px] text-white">C</div>
            <span>© {new Date().getFullYear()} Cadence Software. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-[11px] font-semibold">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Security Compliance</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
