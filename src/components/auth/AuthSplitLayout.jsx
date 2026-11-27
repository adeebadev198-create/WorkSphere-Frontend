import React from 'react';
import logoImg from '../../assets/logo/logo.png';

const AuthSplitLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#EDE9FE] via-[#DDD6FE] to-[#C4B5FD] p-3 sm:p-6 lg:p-10 font-sans selection:bg-purple-600 selection:text-white relative overflow-hidden">
      
      <div className="fixed -top-32 -left-32 w-[30rem] h-[30rem] rounded-full border-[36px] border-white/25 pointer-events-none" />
      <div className="fixed -bottom-40 -right-32 w-[34rem] h-[34rem] rounded-full border-[42px] border-purple-500/15 pointer-events-none" />

      <div className="w-full max-w-[980px] min-h-[590px] rounded-[28px] bg-white shadow-[0_28px_70px_-15px_rgba(76,29,149,0.28)] overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-10 xl:p-12 relative overflow-hidden bg-gradient-to-br from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] text-white select-none">
          
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 700"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="blobGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4C1D95" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.18" />
              </linearGradient>
            </defs>

            <path
              d="M240,-40 L640,-40 L640,260 C490,230 390,140 240,-40 Z"
              fill="url(#blobGrad1)"
            />

            <path
              d="M-40,360 C90,280 210,430 350,370 C470,320 530,440 640,420 L640,740 L-40,740 Z"
              fill="url(#blobGrad2)"
            />

            <g fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2">
              <path d="M-20,60 C40,95 65,165 15,220 C-15,255 -30,270 -40,285" />
              <path d="M-20,30 C65,80 95,175 35,245 C0,285 -20,300 -40,320" />
              <path d="M-10,0 C90,65 125,185 55,270 C15,315 -10,335 -40,355" />
            </g>

            <g fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2">
              <path d="M290,720 C330,630 400,600 470,635 C530,665 570,610 620,560" />
              <path d="M250,720 C300,605 395,565 480,605 C550,638 595,575 630,515" />
              <path d="M210,720 C270,580 390,530 490,575 C570,612 610,545 640,475" />
            </g>
          </svg>

          <div
            className="absolute top-12 right-10 grid grid-cols-3 gap-2.5 opacity-40 pointer-events-none"
            aria-hidden="true"
          >
            {Array.from({ length: 24 }).map((_, idx) => (
              <span key={idx} className="w-1 h-1 rounded-full bg-white" />
            ))}
          </div>
          <span className="absolute top-14 left-1/2 text-white/40 text-lg font-light pointer-events-none">
            +
          </span>
          <span className="absolute top-36 right-28 w-3 h-3 rounded-full border-2 border-white/35 pointer-events-none" />
          <span className="absolute bottom-28 left-44 text-white/40 text-lg font-light pointer-events-none">
            +
          </span>
          <span className="absolute bottom-16 left-16 w-3 h-3 rounded-full border-2 border-white/35 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 px-3 rounded-xl bg-white shadow-md shadow-purple-950/20 flex items-center justify-center">
              <img src={logoImg} alt="WorkSphere" className="h-6 w-auto object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">WorkSphere</span>
          </div>

          <div className="relative z-10 my-auto max-w-sm space-y-3">
            <h2 className="text-3xl xl:text-[34px] font-bold tracking-tight text-white leading-tight">
              {title}
            </h2>
            <p className="text-sm text-purple-100/90 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          <div className="relative z-10 text-[11px] text-purple-200/75 font-medium">
            WorkSphere Workspace Platform
          </div>
        </div>

        <div className="w-full lg:w-[48%] flex flex-col justify-center p-5 sm:p-10 xl:p-12 bg-white">
          
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-2">
              <img src={logoImg} alt="WorkSphere" className="h-7 w-auto object-contain" />
              <span className="text-base font-bold text-slate-900 tracking-tight">WorkSphere</span>
            </div>
          </div>

          <div className="max-w-[360px] w-full mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthSplitLayout;
