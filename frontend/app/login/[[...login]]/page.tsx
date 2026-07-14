import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-ds-bg-neutral-subtle px-4 sm:px-6 lg:px-8 overflow-hidden select-none">


      {/* ── Branded Header ── */}
      <div className="flex flex-col items-center mb-8 z-10">
        <div className="flex items-center space-x-2.5 text-brand font-bold text-3xl tracking-tight">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.553 2.052a.84.84 0 00-.77.012L2.355 7.1c-.43.25-.693.71-.693 1.21v10.38c0 .5.263.96.693 1.21l8.428 5.035c.24.143.524.155.773.033l8.093-3.953a.846.846 0 00.493-.762V9.897a.844.844 0 00-.472-.756L11.553 2.052zM12 4.12l6.837 4.103-6.837 3.34-6.837-3.34L12 4.12z" />
          </svg>
          <span className="font-sans font-extrabold">CADENCE</span>
        </div>
        <p className="mt-2.5 text-sm text-ds-text-subtle font-medium">Log in to continue to your project</p>
      </div>

      {/* ── Clerk Card Wrap ── */}
      <div className="z-10 w-full max-w-[400px] flex justify-center">
        <SignIn
          path="/login"
          signUpUrl="/signup"
          forceRedirectUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#0052CC",
              borderRadius: "3px",
              colorBackground: "#FFFFFF",
            },
            elements: {
              card: "shadow-ds-dialog bg-ds-bg border-none rounded-ds-card px-10 py-10 w-[400px] max-w-full",
              headerTitle: "text-xl font-bold text-ds-text tracking-tight text-center",
              headerSubtitle: "text-ds-text-subtle text-sm text-center mt-1.5",
              formButtonPrimary: "bg-brand hover:bg-brand-hover text-white font-semibold text-sm py-2.5 px-4 rounded-ds-btn transition-colors shadow-none w-full",
              formFieldInput: "bg-ds-bg-neutral-subtle border-ds-border focus:border-ds-border-focus focus:bg-ds-bg text-ds-text rounded-ds-btn transition-colors text-sm w-full py-2 px-3",
              footerActionLink: "text-brand hover:text-brand-hover font-semibold",
              socialButtonsBlockButton: "border-ds-border hover:bg-ds-bg-neutral hover:border-ds-border rounded-ds-btn transition-all text-ds-text font-semibold text-sm py-2.5",
              dividerLine: "bg-ds-border",
              dividerText: "text-ds-text-subtle font-medium text-xs",
            }
          }}
        />
      </div>
    </div>
  );
}
