"use client";
import { useEffect, useState } from "react";
import Login from "@/components/Login";
import MemberDashboard from "@/components/MemberDashboard";
import AdminPanel from "@/components/AdminPanel";
import type { MemberView, PublicFund } from "@/components/types";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberView | null>(null);
  const [fund, setFund] = useState<PublicFund | null>(null);
  const [view, setView] = useState<"member" | "admin">("member");

  async function loadMe() {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setMember(data.member);
        setFund(data.fund);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setMember(null);
    setFund(null);
    setView("member");
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="animate-pulse text-2xl">🌱</div>
      </div>
    );
  }

  if (!member || !fund) {
    return (
      <Login
        onSuccess={() => {
          setLoading(true);
          loadMe();
        }}
      />
    );
  }

  if (view === "admin" && member.isAdmin) {
    return <AdminPanel onBack={() => setView("member")} onLogout={logout} />;
  }

  return (
    <MemberDashboard
      member={member}
      fund={fund}
      onLogout={logout}
      onAdmin={member.isAdmin ? () => setView("admin") : undefined}
    />
  );
}
