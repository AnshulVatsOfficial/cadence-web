import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <div className="flex flex-col min-h-screen bg-ds-bg-neutral-subtle font-sans text-ds-text">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 bg-ds-bg border-b border-ds-border h-[64px]">
        <div className="flex items-center space-x-2 text-brand font-bold text-xl tracking-tight">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.553 2.052a.84.84 0 00-.77.012L2.355 7.1c-.43.25-.693.71-.693 1.21v10.38c0 .5.263.96.693 1.21l8.428 5.035c.24.143.524.155.773.033l8.093-3.953a.846.846 0 00.493-.762V9.897a.844.844 0 00-.472-.756L11.553 2.052zM12 4.12l6.837 4.103-6.837 3.34-6.837-3.34L12 4.12z" />
          </svg>
          <span>CADENCE</span>
        </div>
        <div className="flex items-center space-x-4">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ds-text-subtle hover:text-ds-text transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white font-medium rounded-ds-btn transition-colors"
              >
                Get it free
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-brand hover:text-brand-hover transition-colors mr-2"
              >
                Go to Workspace
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-ds-bg to-ds-bg-neutral-subtle">
        <span className="text-xs font-semibold text-brand uppercase tracking-wider bg-brand-subtle px-2.5 py-1 rounded-full mb-4">
          Secure Single Sign-On Enabled
        </span>
        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-ds-text sm:text-6xl leading-[1.15]">
          Move work forward with <span className="text-brand">Cadence</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ds-text-subtle leading-relaxed">
          The ultimate internal project management tool designed for engineering and design teams. 
          Plan, track, and release world-class software with a Kanban interface.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex h-11 items-center justify-center px-6 bg-brand hover:bg-brand-hover text-white font-medium rounded-ds-btn shadow transition-colors"
          >
            Go to Workspace Dashboard
          </Link>
          {!isLoggedIn && (
            <Link
              href="/signup"
              className="flex h-11 items-center justify-center px-6 border border-ds-border hover:bg-ds-bg-neutral-hover bg-ds-bg font-medium rounded-ds-btn transition-colors"
            >
              Create New Account
            </Link>
          )}
        </div>

        {/* Feature Preview Card */}
        <div className="mt-16 w-full max-w-4xl bg-ds-bg border border-ds-border rounded-ds-card shadow-ds-elevation overflow-hidden p-6 text-left">
          <div className="flex items-center space-x-2 border-b border-ds-border pb-4 mb-4">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-xs text-ds-text-subtle pl-2 font-mono">http://localhost:3000/dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 bg-ds-bg-neutral p-4 rounded-[4px] border border-ds-border h-32 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-ds-text-subtle tracking-wide uppercase">TO DO</span>
                <h4 className="text-xs font-semibold text-ds-text mt-1">Setup production database</h4>
              </div>
              <span className="text-[10px] text-brand font-mono">CAD-101</span>
            </div>
            <div className="col-span-1 bg-ds-bg-neutral p-4 rounded-[4px] border border-ds-border h-32 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-ds-text-subtle tracking-wide uppercase">IN PROGRESS</span>
                <h4 className="text-xs font-semibold text-ds-text mt-1">Implement user signup flow</h4>
              </div>
              <span className="text-[10px] text-brand font-mono">CAD-102</span>
            </div>
            <div className="col-span-1 bg-ds-bg-neutral p-4 rounded-[4px] border border-ds-border h-32 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-ds-text-subtle tracking-wide uppercase">DONE</span>
                <h4 className="text-xs font-semibold text-ds-text mt-1">Configure identity providers</h4>
              </div>
              <span className="text-[10px] text-brand font-mono">CAD-103</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ds-bg border-t border-ds-border py-8 text-center text-xs text-ds-text-subtle">
        <p>&copy; {new Date().getFullYear()} Cadence Software. All rights reserved.</p>
      </footer>
    </div>
  );
}
