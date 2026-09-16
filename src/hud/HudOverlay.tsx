import React, { useEffect, useRef } from 'react';
import { scrollState, smoothstep, clamp01 } from '../state/scrollController';
import { ArenaGateway } from './ArenaGateway';
import { Compass, Gauge, Activity, Lock } from 'lucide-react';

export const HudOverlay: React.FC = () => {
  // Direct DOM references for zero React re-renders on scroll
  const spRef = useRef<HTMLSpanElement>(null);
  const pRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const actBadgeRef = useRef<HTMLDivElement>(null);

  // Act typography overlays
  const act1TextRef = useRef<HTMLDivElement>(null);
  const act2TextRef = useRef<HTMLDivElement>(null);
  const act3TextRef = useRef<HTMLDivElement>(null);

  // Act 4 Login Portal ref
  const gatewayRef = useRef<HTMLDivElement>(null);

  // 4-Act Bottom Timeline DOM refs
  const seg1FillRef = useRef<HTMLDivElement>(null);
  const seg2FillRef = useRef<HTMLDivElement>(null);
  const seg3FillRef = useRef<HTMLDivElement>(null);
  const seg4FillRef = useRef<HTMLDivElement>(null);

  const seg1DotRef = useRef<HTMLSpanElement>(null);
  const seg2DotRef = useRef<HTMLSpanElement>(null);
  const seg3DotRef = useRef<HTMLSpanElement>(null);
  const seg4DotRef = useRef<HTMLSpanElement>(null);

  const seg1TextRef = useRef<HTMLSpanElement>(null);
  const seg2TextRef = useRef<HTMLSpanElement>(null);
  const seg3TextRef = useRef<HTMLSpanElement>(null);
  const seg4TextRef = useRef<HTMLSpanElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;

    const updateHud = () => {
      const p = scrollState.p;
      const sp = scrollState.sp;
      const vel = Math.abs(scrollState.velocity * 1000);

      // 1. Numeric telemetry updates
      if (spRef.current) spRef.current.textContent = sp.toFixed(3);
      if (pRef.current) pRef.current.textContent = p.toFixed(3);
      if (velRef.current) velRef.current.textContent = `${(12.4 + vel * 2.8).toFixed(1)} km/s`;

      // 2. Exact Act Progress & Synchronization (0 -> 1 for each segment)
      // Act 1: sp [0.00 -> 0.20]
      const t1 = clamp01(sp / 0.20);
      // Act 2: sp [0.20 -> 0.38]
      const t2 = sp < 0.20 ? 0 : clamp01((sp - 0.20) / 0.18);
      // Act 3: sp [0.38 -> 0.54]
      const t3 = sp < 0.38 ? 0 : clamp01((sp - 0.38) / 0.16);
      // Act 4: sp [0.54 -> 0.85]
      const t4 = sp < 0.54 ? 0 : clamp01((sp - 0.54) / 0.31);

      // Fill widths for individual act segment tracks
      if (seg1FillRef.current) seg1FillRef.current.style.width = `${t1 * 100}%`;
      if (seg2FillRef.current) seg2FillRef.current.style.width = `${t2 * 100}%`;
      if (seg3FillRef.current) seg3FillRef.current.style.width = `${t3 * 100}%`;
      if (seg4FillRef.current) seg4FillRef.current.style.width = `${t4 * 100}%`;

      // Determine active act index (1 to 4)
      const isAct1 = sp < 0.20;
      const isAct2 = sp >= 0.20 && sp < 0.38;
      const isAct3 = sp >= 0.38 && sp < 0.54;
      const isAct4 = sp >= 0.54;

      // Segment 1 UI State
      if (seg1TextRef.current) {
        seg1TextRef.current.style.color = isAct1 ? '#fde047' : t1 >= 1 ? '#94a3b8' : '#475569';
        seg1TextRef.current.style.fontWeight = isAct1 ? '700' : '500';
      }
      if (seg1DotRef.current) {
        seg1DotRef.current.style.background = isAct1 ? '#fde047' : t1 >= 1 ? '#06b6d4' : '#334155';
        seg1DotRef.current.style.boxShadow = isAct1 ? '0 0 10px #fde047' : 'none';
      }

      // Segment 2 UI State
      if (seg2TextRef.current) {
        seg2TextRef.current.style.color = isAct2 ? '#06b6d4' : t2 >= 1 ? '#94a3b8' : '#475569';
        seg2TextRef.current.style.fontWeight = isAct2 ? '700' : '500';
      }
      if (seg2DotRef.current) {
        seg2DotRef.current.style.background = isAct2 ? '#06b6d4' : t2 >= 1 ? '#06b6d4' : '#334155';
        seg2DotRef.current.style.boxShadow = isAct2 ? '0 0 10px #06b6d4' : 'none';
      }

      // Segment 3 UI State
      if (seg3TextRef.current) {
        seg3TextRef.current.style.color = isAct3 ? '#2dd4bf' : t3 >= 1 ? '#94a3b8' : '#475569';
        seg3TextRef.current.style.fontWeight = isAct3 ? '700' : '500';
      }
      if (seg3DotRef.current) {
        seg3DotRef.current.style.background = isAct3 ? '#2dd4bf' : t3 >= 1 ? '#2dd4bf' : '#334155';
        seg3DotRef.current.style.boxShadow = isAct3 ? '0 0 10px #2dd4bf' : 'none';
      }

      // Segment 4 UI State
      if (seg4TextRef.current) {
        seg4TextRef.current.style.color = isAct4 ? '#f59e0b' : '#475569';
        seg4TextRef.current.style.fontWeight = isAct4 ? '700' : '500';
      }
      if (seg4DotRef.current) {
        seg4DotRef.current.style.background = isAct4 ? '#f59e0b' : '#334155';
        seg4DotRef.current.style.boxShadow = isAct4 ? '0 0 10px #f59e0b' : 'none';
      }

      // 3. Dynamic Act Badge text
      if (actBadgeRef.current) {
        let label = 'ACT I // THE SINGULARITY';
        let badgeColor = '#eab308';

        if (isAct4) {
          label = 'ACT IV // ARENA GATE';
          badgeColor = '#f59e0b';
        } else if (isAct3) {
          label = 'ACT III // ACCESS PROTOCOL';
          badgeColor = '#f87171';
        } else if (isAct2) {
          label = 'ACT II // PLAYER DETECTED';
          badgeColor = '#06b6d4';
        }

        actBadgeRef.current.textContent = label;
        actBadgeRef.current.style.color = badgeColor;
        actBadgeRef.current.style.borderColor = badgeColor;
      }

      // 4. Act 1: Center text removed per user specification
      if (act1TextRef.current) {
        act1TextRef.current.style.display = 'none';
      }

      // 5. Act 2 Typography Overlay (sp 0.18 -> 0.36)
      if (act2TextRef.current) {
        const a2In = smoothstep(0.16, 0.24, sp);
        const a2Out = 1.0 - smoothstep(0.32, 0.38, sp);
        const a2Alpha = a2In * a2Out;
        act2TextRef.current.style.opacity = `${a2Alpha}`;
        act2TextRef.current.style.transform = `translateY(${(1 - a2In) * 30 - smoothstep(0.30, 0.38, sp) * 30}px)`;
        act2TextRef.current.style.textShadow = `0 0 40px rgba(6, 182, 212, ${a2Alpha * 0.5})`;
      }

      // 6. Act 3 Typography Overlay (sp 0.34 -> 0.52)
      if (act3TextRef.current) {
        const a3In = smoothstep(0.32, 0.40, sp);
        const a3Out = 1.0 - smoothstep(0.48, 0.54, sp);
        const a3Alpha = a3In * a3Out;
        act3TextRef.current.style.opacity = `${a3Alpha}`;
        act3TextRef.current.style.transform = `translateY(${(1 - a3In) * 30 - smoothstep(0.46, 0.54, sp) * 30}px)`;
        act3TextRef.current.style.textShadow = `0 0 40px rgba(45, 212, 191, ${a3Alpha * 0.5})`;
      }

      // 7. Act 4: Team Login Portal (docks in smoothly at sp >= 0.48 -> 1.0)
      if (gatewayRef.current) {
        const a4In = smoothstep(0.46, 0.60, sp);
        gatewayRef.current.style.opacity = `${a4In}`;
        gatewayRef.current.style.transform = `translateY(${(1.0 - a4In) * 35}px)`;
        gatewayRef.current.style.pointerEvents = a4In > 0.5 ? 'auto' : 'none';
        gatewayRef.current.style.visibility = a4In < 0.01 ? 'hidden' : 'visible';
      }

      // 8. Scroll indicator: visible only in early Act 1
      if (scrollIndicatorRef.current) {
        const scrollAlpha = 1.0 - smoothstep(0.02, 0.10, sp);
        scrollIndicatorRef.current.style.opacity = `${scrollAlpha}`;
        scrollIndicatorRef.current.style.visibility = scrollAlpha < 0.01 ? 'hidden' : 'visible';
      }

      animId = requestAnimationFrame(updateHud);
    };

    animId = requestAnimationFrame(updateHud);
    return () => cancelAnimationFrame(animId);
  }, []);

  const scrollToAct = (targetSp: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetP = targetSp * 0.82;
    window.scrollTo({
      top: scrollHeight * targetP,
      behavior: 'smooth',
    });
  };

  return (
    <div className="hud-layer">
      {/* ── TOP HUD NAVIGATION / TELEMETRY ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', pointerEvents: 'auto' }}>
        {/* Brand & Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={`${import.meta.env.BASE_URL}mpl_logo.png`}
              alt="MPL Crest"
              style={{
                width: '34px',
                height: '34px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(234, 179, 8, 0.6))',
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.12em', color: '#f8fafc' }}>
              MATH PREMIER LEAGUE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              ref={actBadgeRef}
              className="mono-label"
              style={{
                border: '1px solid #eab308',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '10px',
                background: 'rgba(7, 9, 19, 0.7)',
                color: '#eab308',
                transition: 'border-color 0.2s, color 0.2s',
                textShadow: '0 0 12px currentColor',
              }}
            >
              ACT I // THE SINGULARITY
            </span>
            <span className="mono-label" style={{ color: '#64748b' }}>
              ONLINE ARENA
            </span>
          </div>
        </div>

        {/* Live Flight Telemetry Readouts + Quick Login Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="glass-panel"
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={13} color="#06b6d4" />
              <div>
                <div className="mono-label" style={{ fontSize: '8px' }}>AXIS [sp]</div>
                <span ref={spRef} className="mono-value" style={{ color: '#06b6d4', fontSize: '11px' }}>0.000</span>
              </div>
            </div>

            <div style={{ width: '1px', height: '18px', background: 'rgba(148, 163, 184, 0.15)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gauge size={13} color="#2dd4bf" />
              <div>
                <div className="mono-label" style={{ fontSize: '8px' }}>TRACK [p]</div>
                <span ref={pRef} className="mono-value" style={{ color: '#2dd4bf', fontSize: '11px' }}>0.000</span>
              </div>
            </div>

            <div style={{ width: '1px', height: '18px', background: 'rgba(148, 163, 184, 0.15)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={13} color="#fde047" />
              <div>
                <div className="mono-label" style={{ fontSize: '8px' }}>VELOCITY</div>
                <span ref={velRef} className="mono-value" style={{ color: '#fde047', fontSize: '11px' }}>12.4 km/s</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => scrollToAct(0.70)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(202, 138, 4, 0.15))',
              border: '1px solid rgba(234, 179, 8, 0.5)',
              color: '#fde047',
              fontWeight: 700,
              fontSize: '0.80rem',
              cursor: 'pointer',
              letterSpacing: '0.06em',
              boxShadow: '0 0 15px rgba(234, 179, 8, 0.25)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #eab308, #ca8a04)';
              e.currentTarget.style.color = '#070913';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(202, 138, 4, 0.15))';
              e.currentTarget.style.color = '#fde047';
            }}
          >
            <Lock size={12} />
            <span>ENTER</span>
          </button>
        </div>
      </div>

      {/* ── CENTER CINEMATIC ACT TEXT OVERLAYS ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', textAlign: 'center' }}>
        {/* ACT 1: Hidden div to prevent layout overhead */}
        <div ref={act1TextRef} style={{ display: 'none' }} />

        {/* ACT 2: Player Detected / SIAM-VIT Equations */}
        <div
          ref={act2TextRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            padding: '0 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="mono-label" style={{ color: '#06b6d4', letterSpacing: '0.22em', fontSize: '11px' }}>
              53 49 41 4D // HPBN // FVNZ
            </span>
            <span className="mono-label" style={{ color: '#64748b', fontSize: '11px' }}>•</span>
            <span className="mono-label" style={{ color: '#fde047', letterSpacing: '0.18em', fontSize: '11px' }}>
              SIAM-VIT
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 5.2vw, 3.8rem)', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
            [ PLAYER DETECTED ]
          </h2>
          <p style={{ color: '#e2e8f0', fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 600, marginTop: '10px', marginBottom: '4px', letterSpacing: '0.03em' }}>
            Your move. Your logic. Your game.
          </p>
          <p style={{ color: '#94a3b8', maxWidth: '540px', marginTop: '6px', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Where equations spark ideas, and ideas become innovation.
          </p>
        </div>

        {/* ACT 3: Access Denied / The Logic Gauntlet */}
        <div
          ref={act3TextRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            padding: '0 20px',
          }}
        >
          <span className="mono-label" style={{ color: '#f87171', letterSpacing: '0.25em', marginBottom: '8px', fontSize: '11px' }}>
            SECURITY PROTOCOL // MATH PREMIER LEAGUE
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 5.2vw, 3.8rem)', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, textShadow: '0 0 35px rgba(239, 68, 68, 0.45)' }}>
            ACCESS: DENIED
          </h2>
          <p style={{ color: '#e2e8f0', fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 600, marginTop: '10px', marginBottom: '6px', letterSpacing: '0.03em' }}>
            Think you can find your way in?
          </p>
          <p style={{ color: '#2dd4bf', maxWidth: '520px', marginTop: '8px', fontSize: '0.95rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: '0.04em' }}>
            &gt; ENTER MPL — No hints. No shortcuts. Just skill.
          </p>
        </div>
      </div>

      {/* ── SCROLL TO EXPLORE INDICATOR ── */}
      <div
        ref={scrollIndicatorRef}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
          opacity: 1,
        }}
      >
        <span
          className="mono-label"
          style={{
            fontSize: '9px',
            color: '#94a3b8',
            letterSpacing: '0.2em',
          }}
        >
          SCROLL TO EXPLORE
        </span>
        <div className="scroll-indicator-chevron">
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2L10 10L18 2" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ── ACT 4: ARENA GATE PAGE ── */}
      <ArenaGateway gatewayRef={gatewayRef} />

      {/* ── BOTTOM SYNCHRONIZED 4-ACT TIMELINE & NAVIGATION ── */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {/* Segment 1: Act I Singularity */}
          <button
            type="button"
            onClick={() => scrollToAct(0.0)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                ref={seg1DotRef}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#fde047',
                  boxShadow: '0 0 8px #fde047',
                  display: 'inline-block',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              />
              <span
                ref={seg1TextRef}
                className="mono-label"
                style={{ fontSize: '9px', color: '#fde047', letterSpacing: '0.08em', transition: 'color 0.2s' }}
              >
                I: SINGULARITY
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '3px',
                background: 'rgba(148, 163, 184, 0.15)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                ref={seg1FillRef}
                style={{
                  width: '0%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #eab308, #fde047)',
                  boxShadow: '0 0 8px rgba(253, 224, 71, 0.6)',
                }}
              />
            </div>
          </button>

          {/* Segment 2: Act II Acceleration */}
          <button
            type="button"
            onClick={() => scrollToAct(0.25)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                ref={seg2DotRef}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#334155',
                  display: 'inline-block',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              />
              <span
                ref={seg2TextRef}
                className="mono-label"
                style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.08em', transition: 'color 0.2s' }}
              >
                II: PLAYER DETECTED
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '3px',
                background: 'rgba(148, 163, 184, 0.15)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                ref={seg2FillRef}
                style={{
                  width: '0%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                  boxShadow: '0 0 8px rgba(6, 182, 212, 0.6)',
                }}
              />
            </div>
          </button>

          {/* Segment 3: Act III Access Protocol */}
          <button
            type="button"
            onClick={() => scrollToAct(0.42)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                ref={seg3DotRef}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#334155',
                  display: 'inline-block',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              />
              <span
                ref={seg3TextRef}
                className="mono-label"
                style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.08em', transition: 'color 0.2s' }}
              >
                III: ACCESS PROTOCOL
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '3px',
                background: 'rgba(148, 163, 184, 0.15)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                ref={seg3FillRef}
                style={{
                  width: '0%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #2dd4bf, #14b8a6)',
                  boxShadow: '0 0 8px rgba(45, 212, 191, 0.6)',
                }}
              />
            </div>
          </button>

          {/* Segment 4: Act IV Team Login */}
          <button
            type="button"
            onClick={() => scrollToAct(0.70)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                ref={seg4DotRef}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#334155',
                  display: 'inline-block',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              />
              <span
                ref={seg4TextRef}
                className="mono-label"
                style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.08em', transition: 'color 0.2s' }}
              >
                IV: ARENA GATE
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '3px',
                background: 'rgba(148, 163, 184, 0.15)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                ref={seg4FillRef}
                style={{
                  width: '0%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b, #eab308)',
                  boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
                }}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
