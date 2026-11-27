import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo/logo.png';
import { Kanban, ShieldCheck, Users, BarChart3, CheckCircle2 } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      <div className="flex flex-col justify-between w-full px-6 py-8 md:w-1/2 lg:w-5/12 sm:px-10 lg:px-14 xl:px-16 bg-white border-r border-slate-200/80 z-10 shadow-xs">
        <div>
          
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <img
              src={logoImg}
              alt="WorkSphere"
              className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          <div className="w-full max-w-sm mx-auto">
            {children}
          </div>
        </div>

        <div className="pt-8 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} WorkSphere Inc. All rights reserved. Secure enterprise session.
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 lg:w-7/12 bg-slate-900 p-12 lg:p-16 relative flex-col justify-between overflow-hidden">
        
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-purple-200 border border-white/10 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise Project & Team Management
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Coordinate projects, teams & deliverables from one central hub.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            WorkSphere centralizes multi-workspace management, drag-and-drop Kanban execution, activity audits, and workload intelligence.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs">
              <Kanban className="w-4 h-4 text-purple-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-0.5">Interactive Kanban</h4>
              <p className="text-[11px] text-slate-400">Drag & drop workflow status updates with real-time database sync.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-purple-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-0.5">Role-Based Access</h4>
              <p className="text-[11px] text-slate-400">Enforced Owner, Project Manager & Team Member permissions.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs">
              <Users className="w-4 h-4 text-purple-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-0.5">Isolated Workspaces</h4>
              <p className="text-[11px] text-slate-400">Departmental multi-tenancy with secure member invitations.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xs">
              <BarChart3 className="w-4 h-4 text-purple-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-0.5">Live Analytics & CSV</h4>
              <p className="text-[11px] text-slate-400">Automated project progress calculation and report exports.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>MongoDB Data Persistence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>JWT Bearer Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
