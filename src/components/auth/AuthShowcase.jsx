// src/components/auth/AuthShowcase.jsx
import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Globe,
  Layers,
  KanbanSquare,
  BarChart3,
  Lock,
} from 'lucide-react';
import logoImg from '../../assets/logo/logo.png';

/**
 * Shared VIP Purple & White brand showcase panel for Login and Register pages.
 */
const AuthShowcase = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';

  return (
    <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-10 xl:p-12 relative overflow-hidden bg-gradient-to-br from-[#2E1065] via-[#5B21B6] to-[#6D28D9] text-white select-none">
      {/* Subtle architectural grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Soft luminous purple/white ambient highlights */}
      <div
        className="absolute -top-28 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute -bottom-28 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(196, 181, 253, 0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Top Brand Header — Pure white badge so the purple WorkSphere logo shines */}
      <div className="relative z-10 flex items-center gap-3.5">
        <div className="h-11 px-3.5 rounded-2xl bg-white shadow-lg shadow-purple-950/25 flex items-center justify-center">
          <img src={logoImg} alt="WorkSphere" className="h-7 w-auto object-contain" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white">WorkSphere</span>
          <p className="text-[11px] text-purple-200/90 font-medium tracking-wide">
            Plan &bull; Collaborate &bull; Achieve
          </p>
        </div>
      </div>

      {/* Centerpiece Showcase Card */}
      <div className="relative z-10 my-auto py-8">
        <div className="p-6 rounded-2xl bg-white/[0.09] border border-white/15 shadow-2xl shadow-purple-950/30 backdrop-blur-xl space-y-5">
          {isLogin ? (
            <>
              <div className="flex items-center justify-between border-b border-white/15 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-semibold text-white tracking-tight">
                    Q4 Product Launch
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-purple-100 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                  On Track
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-purple-100/90">
                  <span className="font-medium">Milestone Progress</span>
                  <span className="font-bold text-white">86%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-white via-purple-200 to-violet-200 w-[86%]" />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  { title: 'Design System & Brand Refresh', badge: 'Completed' },
                  { title: 'Client Portal & Team Workflows', badge: 'In Review' },
                  { title: 'Executive Velocity Reporting', badge: 'Active' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                      <span className="truncate text-[11px] font-medium text-white/95">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-100 font-medium px-2 py-0.5 rounded-md bg-white/10 shrink-0">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-white/15 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-200" />
                  <span className="text-xs font-semibold text-white tracking-tight">
                    Built for High-Velocity Teams
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-purple-100 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                  All-in-One
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  {
                    icon: Layers,
                    title: 'Unified Workspaces',
                    desc: 'Dedicated spaces for every department and initiative.',
                  },
                  {
                    icon: KanbanSquare,
                    title: 'Visual Kanban',
                    desc: 'Effortless task tracking from kickoff to delivery.',
                  },
                  {
                    icon: Lock,
                    title: 'Role Permissions',
                    desc: 'Clear access controls tailored for every team member.',
                  },
                  {
                    icon: BarChart3,
                    title: 'Team Analytics',
                    desc: 'Actionable sprint insights and instant CSV exports.',
                  },
                ].map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.07] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <Icon className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-[10px] text-purple-100/75 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Headline */}
        <div className="mt-8 space-y-2.5">
          <h2 className="text-2xl xl:text-[26px] font-bold text-white tracking-tight leading-snug">
            {isLogin ? (
              <>
                Plan with clarity.
                <br />
                <span className="text-purple-200">Ship with confidence.</span>
              </>
            ) : (
              <>
                Where modern teams
                <br />
                <span className="text-purple-200">build together.</span>
              </>
            )}
          </h2>
          <p className="text-xs text-purple-100/80 leading-relaxed max-w-sm">
            {isLogin
              ? 'One cohesive workspace to align priorities, streamline execution, and keep every team moving forward.'
              : 'Launch your collaborative workspace in seconds with structured workflows, clear ownership, and live visibility.'}
          </p>
        </div>
      </div>

      {/* Bottom International SaaS Trust Strip */}
      <div className="relative z-10 flex items-center gap-6 pt-4 border-t border-white/15 text-[11px] text-purple-100/85 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-200" />
          <span>Enterprise Security</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-purple-200" />
          <span>99.9% Uptime</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>SOC 2 Ready</span>
        </div>
      </div>
    </div>
  );
};

export default AuthShowcase;
