"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, LockKeyhole, ShieldCheck } from "lucide-react";
import { useDemo } from "@/state/demo-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, session, sessionReady } = useDemo();
  const [organizationCode, setOrganizationCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (sessionReady && session) router.replace("/dashboard"); }, [sessionReady, session, router]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!organizationCode.trim() || !username.trim() || !password) { setError("Enter your organization code, username and password."); return; }
    setLoading(true);
    const ok = await login({ organizationCode, username, password }, remember);
    setLoading(false);
    if (!ok) { setError("The organization code or sign-in details are incorrect."); return; }
    router.replace("/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-[#F3F5F0] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden flex-col justify-between bg-[#153F36] p-12 text-white lg:flex">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><FlaskConical className="h-6 w-6" /></span><div><p className="font-display text-2xl font-semibold">Qlyno</p><p className="text-[10px] uppercase tracking-[0.18em] text-white/65">Laboratory Portal</p></div></div>
        <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Connected laboratory operations</p><h1 className="mt-4 font-display text-5xl font-semibold leading-tight">One secure workspace for every laboratory workflow.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-white/70">Your organization configuration automatically applies the correct clinical, operational and billing experience after authentication.</p></div>
        <div className="flex items-center gap-2 text-xs text-white/60"><ShieldCheck className="h-4 w-4" /> Tenant-isolated frontend prototype</div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white"><FlaskConical className="h-5 w-5" /></span><div><p className="font-display text-xl font-semibold">Qlyno</p><p className="text-[9px] uppercase tracking-[0.14em] text-text-muted">Laboratory Portal</p></div></div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-blue">Welcome back</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-text-main">Sign in to Laboratory Portal</h2>
          <p className="mt-2 text-sm text-text-muted">Use the organization code issued by your laboratory administrator.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <Field label="Organization / Laboratory Code" value={organizationCode} onChange={setOrganizationCode} placeholder="e.g. ORGANIZATION-CODE" autoComplete="organization" />
            <Field label="Email, employee ID or username" value={username} onChange={setUsername} placeholder="Enter your username" autoComplete="username" />
            <Field label="Password" value={password} onChange={setPassword} placeholder="Enter your password" type="password" autoComplete="current-password" />
            <div className="flex items-center justify-between gap-3 text-xs"><label className="flex cursor-pointer items-center gap-2 text-text-muted"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-[#176B5B]" /> Remember me</label><button type="button" disabled title="Password recovery is not connected in this frontend prototype" className="font-semibold text-brand-blue disabled:cursor-not-allowed disabled:opacity-60">Forgot password?</button></div>
            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-status-critical">{error}</div>}
            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-control bg-brand-blue text-sm font-semibold text-white transition hover:bg-[#12594C] disabled:cursor-wait disabled:opacity-70">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Signing in...</> : <><LockKeyhole className="h-4 w-4" /> Sign in</>}</button>
          </form>
          <div className="mt-7 rounded-lg border border-app-border bg-white/70 p-4"><p className="text-xs font-semibold text-text-main">Hospital single sign-on</p><p className="mt-1 text-xs leading-5 text-text-muted">Authorized hospital users launched from their HMS can enter directly without signing in again.</p></div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", autoComplete }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-text-main">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} type={type} autoComplete={autoComplete} placeholder={placeholder} className="h-11 w-full rounded-control border border-app-border bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15" /></label>;
}
