// src/components/common/LoadingScreen.jsx
import React from 'react';
import logoImg from '../../assets/logo/logo.png';

const LoadingScreen = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0f4ff 100%)',
      }}
    >
      {/* Decorative blurred blobs */}
      <div
        style={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
          bottom: '15%',
          right: '20%',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(226,232,240,0.8)',
          borderRadius: 24,
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 20px 60px rgba(79,70,229,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          minWidth: 320,
        }}
      >
        {/* Logo with pulse animation */}
        <div
          style={{
            animation: 'ws-pulse 2s ease-in-out infinite',
            marginBottom: 20,
          }}
        >
          <img
            src={logoImg}
            alt="WorkSphere"
            style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 16 }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Brand name */}
        <div style={{ marginBottom: 6, textAlign: 'center' }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            WorkSphere
          </span>
        </div>
        <p
          style={{
            fontSize: 12,
            color: '#94A3B8',
            fontWeight: 400,
            letterSpacing: '0.02em',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          Manage projects. Lead teams. Deliver results.
        </p>

        {/* Progress bar track */}
        <div
          style={{
            width: 200,
            height: 3,
            background: '#E2E8F0',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #2563EB, #4F46E5)',
              animation: 'ws-progress 1.6s ease-in-out infinite',
              transformOrigin: 'left',
            }}
          />
        </div>

        <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 500, letterSpacing: '0.08em' }}>
          LOADING WORKSPACE…
        </span>
      </div>

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes ws-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes ws-progress {
          0%   { width: 0%; opacity: 1; }
          60%  { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
