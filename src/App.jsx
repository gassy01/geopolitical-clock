import { useState, useEffect, useCallback, useRef } from "react";

// ─── Timezone definitions ───────────────────────────────────────────────────
const PRIMARY_ZONE = {
  id: "primary",
  label: "WASHINGTON D.C.",
  sublabel: "UNITED STATES",
  timezone: "America/New_York",
  abbr: "EST/EDT",
  flag: "🇺🇸",
  status: "MONITORING",
};

const SECONDARY_ZONES = [
  {
    id: "iran",
    label: "TEHRAN",
    sublabel: "IRAN",
    timezone: "Asia/Tehran",
    abbr: "IRST",
    flag: "🇮🇷",
    status: "HIGH ALERT",
    statusColor: "text-red-500",
  },
  {
    id: "iraq",
    label: "BAGHDAD",
    sublabel: "IRAQ",
    timezone: "Asia/Baghdad",
    abbr: "AST",
    flag: "🇮🇶",
    status: "ELEVATED",
    statusColor: "text-orange-500",
  },
  {
    id: "israel",
    label: "JERUSALEM",
    sublabel: "ISRAEL",
    timezone: "Asia/Jerusalem",
    abbr: "IST",
    flag: "🇮🇱",
    status: "HIGH ALERT",
    statusColor: "text-red-500",
  },
  {
    id: "saudi",
    label: "RIYADH",
    sublabel: "SAUDI ARABIA",
    timezone: "Asia/Riyadh",
    abbr: "AST",
    flag: "🇸🇦",
    status: "WATCHLIST",
    statusColor: "text-amber-400",
  },
  {
    id: "lebanon",
    label: "BEIRUT",
    sublabel: "LEBANON",
    timezone: "Asia/Beirut",
    abbr: "EET",
    flag: "🇱🇧",
    status: "ELEVATED",
    statusColor: "text-orange-500",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function getTimeInZone(timezone) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function getDateInZone(timezone) {
  const now = new Date();
  const opts = {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", opts).format(now);
}

function getCountdownToTarget(timezone, targetHour = 20) {
  const now = new Date();
  // Get current time in the target timezone
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);

  const h = parseInt(parts.find((p) => p.type === "hour")?.value || 0);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value || 0);
  const s = parseInt(parts.find((p) => p.type === "second")?.value || 0);

  const currentSeconds = h * 3600 + m * 60 + s;
  const targetSeconds = targetHour * 3600;

  let diff = targetSeconds - currentSeconds;
  if (diff < 0) diff += 86400; // next day

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return { hours, minutes, seconds, total: diff };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// ─── Components ─────────────────────────────────────────────────────────────

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="pulse-live w-2.5 h-2.5 rounded-full bg-red-600"
        style={{ boxShadow: "0 0 8px rgba(220,38,38,0.8)" }}
      />
      <span className="font-body text-xs font-600 tracking-widest text-red-500 uppercase">
        LIVE
      </span>
    </div>
  );
}

function StatusBadge({ status, color }) {
  return (
    <span
      className={`font-body text-xs tracking-widest uppercase font-semibold ${color}`}
    >
      {status}
    </span>
  );
}

function PrimaryClockCard({ zone, time, date }) {
  const [hh, mm, ss] = time.split(":");

  return (
    <div
      className="relative border-glow rounded-none p-6 md:p-10 flicker overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,10,14,0.98) 0%, rgba(16,8,8,0.98) 100%)",
        border: "1px solid rgba(220,38,38,0.3)",
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-8 h-8"
        style={{
          borderTop: "2px solid rgba(220,38,38,0.7)",
          borderLeft: "2px solid rgba(220,38,38,0.7)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-8 h-8"
        style={{
          borderTop: "2px solid rgba(220,38,38,0.7)",
          borderRight: "2px solid rgba(220,38,38,0.7)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-8 h-8"
        style={{
          borderBottom: "2px solid rgba(220,38,38,0.7)",
          borderLeft: "2px solid rgba(220,38,38,0.7)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-8 h-8"
        style={{
          borderBottom: "2px solid rgba(220,38,38,0.7)",
          borderRight: "2px solid rgba(220,38,38,0.7)",
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{zone.flag}</span>
            <span
              className="font-display text-4xl md:text-5xl tracking-widest"
              style={{ color: "#e8e0d0" }}
            >
              {zone.label}
            </span>
          </div>
          <div className="font-body text-xs tracking-[0.3em] text-red-600/70 uppercase pl-10">
            {zone.sublabel} · {zone.abbr}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <LiveIndicator />
          <span className="font-body text-xs tracking-widest text-red-600/60 uppercase">
            PRIMARY
          </span>
        </div>
      </div>

      {/* Main clock */}
      <div className="flex items-baseline justify-center gap-2 md:gap-4 my-4 md:my-6">
        <span
          className="clock-digit glow-red"
          style={{
            fontSize: "clamp(4rem, 18vw, 9rem)",
            lineHeight: 1,
            color: "#ef4444",
            letterSpacing: "0.05em",
          }}
        >
          {hh}
        </span>
        <span
          className="clock-digit glow-red"
          style={{
            fontSize: "clamp(3rem, 12vw, 6rem)",
            lineHeight: 1,
            color: "rgba(220,38,38,0.5)",
            animation: "pulse-sep 1s step-end infinite",
          }}
        >
          :
        </span>
        <span
          className="clock-digit glow-red"
          style={{
            fontSize: "clamp(4rem, 18vw, 9rem)",
            lineHeight: 1,
            color: "#ef4444",
            letterSpacing: "0.05em",
          }}
        >
          {mm}
        </span>
        <span
          className="clock-digit glow-red"
          style={{
            fontSize: "clamp(3rem, 12vw, 6rem)",
            lineHeight: 1,
            color: "rgba(220,38,38,0.5)",
          }}
        >
          :
        </span>
        <span
          className="clock-digit"
          style={{
            fontSize: "clamp(2rem, 8vw, 4.5rem)",
            lineHeight: 1,
            color: "rgba(220,38,38,0.65)",
            letterSpacing: "0.05em",
          }}
        >
          {ss}
        </span>
      </div>

      {/* Date */}
      <div className="text-center font-body text-sm md:text-base tracking-[0.2em] text-red-900/80 uppercase mt-2">
        {date}
      </div>

      {/* Bottom scan line decoration */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(220,38,38,0.5), transparent)",
        }}
      />
    </div>
  );
}

function SecondaryClockCard({ zone, time, date }) {
  const [hh, mm, ss] = time.split(":");

  return (
    <div
      className="relative rounded-none p-4 md:p-5 secondary-border-glow"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,10,14,0.97) 0%, rgba(12,10,8,0.97) 100%)",
        border: "1px solid rgba(234,88,12,0.2)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(234,88,12,0.5), transparent)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{zone.flag}</span>
          <div>
            <div
              className="font-display tracking-widest text-lg"
              style={{ color: "#e0d4c0", lineHeight: 1 }}
            >
              {zone.label}
            </div>
            <div className="font-body text-xs tracking-widest text-orange-900/70 uppercase">
              {zone.sublabel}
            </div>
          </div>
        </div>
        <StatusBadge status={zone.status} color={zone.statusColor} />
      </div>

      {/* Clock */}
      <div className="flex items-baseline gap-1 my-2">
        <span
          className="clock-digit glow-orange"
          style={{
            fontSize: "clamp(2.2rem, 8vw, 3.5rem)",
            lineHeight: 1,
            color: "#ea580c",
            letterSpacing: "0.04em",
          }}
        >
          {hh}
        </span>
        <span
          className="clock-digit"
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            color: "rgba(234,88,12,0.4)",
            lineHeight: 1,
          }}
        >
          :
        </span>
        <span
          className="clock-digit glow-orange"
          style={{
            fontSize: "clamp(2.2rem, 8vw, 3.5rem)",
            lineHeight: 1,
            color: "#ea580c",
            letterSpacing: "0.04em",
          }}
        >
          {mm}
        </span>
        <span
          className="clock-digit"
          style={{
            fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
            color: "rgba(234,88,12,0.4)",
            lineHeight: 1,
          }}
        >
          :
        </span>
        <span
          className="clock-digit"
          style={{
            fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
            color: "rgba(234,88,12,0.5)",
            lineHeight: 1,
          }}
        >
          {ss}
        </span>
      </div>

      {/* Date */}
      <div className="font-body text-xs tracking-widest text-orange-900/60 uppercase mt-1">
        {date}
      </div>

      {/* Abbr */}
      <div
        className="absolute top-3 right-3 font-mono text-xs tracking-widest"
        style={{ color: "rgba(234,88,12,0.3)" }}
      >
        {zone.abbr}
      </div>
    </div>
  );
}

function CountdownTimer({ timezone, targetHour = 20 }) {
  const [countdown, setCountdown] = useState(
    getCountdownToTarget(timezone, targetHour)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(getCountdownToTarget(timezone, targetHour));
    }, 1000);
    return () => clearInterval(id);
  }, [timezone, targetHour]);

  const isZero = countdown.total === 0;
  const isUrgent = countdown.total < 3600; // less than 1 hour

  return (
    <div
      className={`relative rounded-none p-5 md:p-7 ${isZero ? "alert-flash" : ""}`}
      style={{
        background: isUrgent
          ? "linear-gradient(135deg, rgba(16,4,4,0.99) 0%, rgba(20,6,4,0.99) 100%)"
          : "linear-gradient(135deg, rgba(10,10,14,0.98) 0%, rgba(12,8,4,0.98) 100%)",
        border: isUrgent
          ? "1px solid rgba(220,38,38,0.5)"
          : "1px solid rgba(245,158,11,0.25)",
        boxShadow: isUrgent
          ? "0 0 30px rgba(220,38,38,0.15), inset 0 0 30px rgba(220,38,38,0.05)"
          : "0 0 0 1px rgba(245,158,11,0.1)",
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-5 h-5"
        style={{
          borderTop: "1px solid rgba(245,158,11,0.5)",
          borderLeft: "1px solid rgba(245,158,11,0.5)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-5 h-5"
        style={{
          borderBottom: "1px solid rgba(245,158,11,0.5)",
          borderRight: "1px solid rgba(245,158,11,0.5)",
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-display text-2xl md:text-3xl tracking-widest text-amber-400/80">
            COUNTDOWN
          </div>
          <div className="font-body text-xs tracking-[0.3em] text-amber-900/60 uppercase">
            TARGET: 20:00 EST · WASHINGTON D.C.
          </div>
        </div>
        {isUrgent && !isZero && (
          <span className="font-body text-xs tracking-widest text-red-500 uppercase font-semibold animate-pulse">
            ⚠ IMMINENT
          </span>
        )}
      </div>

      {isZero ? (
        <div className="text-center py-4">
          <div
            className="font-display text-5xl md:text-7xl tracking-widest glow-red"
            style={{ color: "#ef4444" }}
          >
            00:00:00
          </div>
          <div className="font-body text-sm tracking-widest text-red-500 uppercase mt-3 animate-pulse">
            ● TARGET TIME REACHED
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-2 md:gap-4">
          {[
            { val: countdown.hours, label: "HRS" },
            { val: countdown.minutes, label: "MIN" },
            { val: countdown.seconds, label: "SEC" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`clock-digit ${
                  isUrgent ? "glow-red" : "glow-amber"
                }`}
                style={{
                  fontSize: "clamp(2.5rem, 10vw, 5rem)",
                  lineHeight: 1,
                  color: isUrgent ? "#ef4444" : "#f59e0b",
                  letterSpacing: "0.05em",
                }}
              >
                {pad(item.val)}
              </span>
              <span
                className="font-body text-xs tracking-widest mt-1"
                style={{ color: isUrgent ? "rgba(220,38,38,0.5)" : "rgba(245,158,11,0.4)" }}
              >
                {item.label}
              </span>
              {i < 2 && (
                <span
                  className="absolute"
                  style={{ display: "none" }}
                />
              )}
            </div>
          ))}
          <div
            className="self-start pt-1 font-body text-xs tracking-widest uppercase"
            style={{ color: "rgba(245,158,11,0.35)" }}
          >
            UNTIL<br />20:00
          </div>
        </div>
      )}
    </div>
  );
}

function ThreatLevel() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-2 rounded-none"
      style={{
        background: "rgba(220,38,38,0.08)",
        border: "1px solid rgba(220,38,38,0.2)",
      }}
    >
      <span className="font-body text-xs tracking-[0.3em] text-red-500/70 uppercase">
        DEFCON WATCH
      </span>
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-none"
          style={{
            background:
              level <= 3
                ? level === 1
                  ? "rgba(220,38,38,0.9)"
                  : level === 2
                  ? "rgba(234,88,12,0.8)"
                  : "rgba(245,158,11,0.6)"
                : "rgba(255,255,255,0.05)",
            border:
              level <= 3
                ? "none"
                : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span className="font-mono text-xs font-bold text-white/80">
            {level}
          </span>
        </div>
      ))}
      <span className="font-mono text-xs text-orange-500/60 ml-2">
        ELEVATED
      </span>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tick, setTick] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const appRef = useRef(null);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Fullscreen handler
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await appRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Compute times
  const primaryTime = getTimeInZone(PRIMARY_ZONE.timezone);
  const primaryDate = getDateInZone(PRIMARY_ZONE.timezone);
  const secondaryTimes = SECONDARY_ZONES.map((z) => ({
    time: getTimeInZone(z.timezone),
    date: getDateInZone(z.timezone),
  }));

  // Current UTC time
  const utcTime = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

  return (
    <div
      ref={appRef}
      className="min-h-screen noise-bg"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(60,8,8,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(40,16,4,0.1) 0%, transparent 50%), #080a0c",
      }}
    >
      {/* ── Header bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-3"
        style={{
          background: "rgba(8,10,12,0.95)",
          borderBottom: "1px solid rgba(220,38,38,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="font-display text-xl md:text-2xl tracking-[0.3em] glow-red"
            style={{ color: "#ef4444" }}
          >
            GEO<span style={{ color: "#e8e0d0" }}>WATCH</span>
          </div>
          <div
            className="hidden md:block w-px h-5"
            style={{ background: "rgba(220,38,38,0.3)" }}
          />
          <div className="hidden md:flex items-center gap-3">
            <LiveIndicator />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* UTC clock */}
          <div className="flex items-center gap-2">
            <span className="font-body text-xs tracking-widest text-white/30 uppercase hidden md:block">
              UTC
            </span>
            <span
              className="clock-digit text-sm md:text-base"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {utcTime}
            </span>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 font-body text-xs tracking-widest uppercase transition-all duration-200"
            style={{
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "rgba(220,38,38,0.8)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220,38,38,0.2)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(220,38,38,0.1)";
              e.currentTarget.style.color = "rgba(220,38,38,0.8)";
            }}
          >
            {isFullscreen ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
                <span className="hidden md:inline">EXIT</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                <span className="hidden md:inline">FULLSCREEN</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="px-3 md:px-6 lg:px-10 py-4 md:py-6 max-w-[1600px] mx-auto">

        {/* Threat level bar */}
        <div className="mb-4 md:mb-6">
          <ThreatLevel />
        </div>

        {/* Top grid: Primary clock + Countdown */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5 mb-4 md:mb-5">
          {/* Primary clock – takes 3 cols */}
          <div className="lg:col-span-3">
            <PrimaryClockCard
              zone={PRIMARY_ZONE}
              time={primaryTime}
              date={primaryDate}
            />
          </div>
          {/* Countdown – takes 2 cols */}
          <div className="lg:col-span-2">
            <CountdownTimer
              timezone={PRIMARY_ZONE.timezone}
              targetHour={20}
            />

            {/* Ticker / info block */}
            <div
              className="mt-4 p-4"
              style={{
                background: "rgba(10,10,14,0.97)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="font-body text-xs tracking-[0.3em] text-white/20 uppercase mb-3">
                REGION STATUS
              </div>
              {SECONDARY_ZONES.map((z) => (
                <div
                  key={z.id}
                  className="flex items-center justify-between py-1.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{z.flag}</span>
                    <span className="font-body text-xs tracking-widest text-white/40 uppercase">
                      {z.sublabel}
                    </span>
                  </div>
                  <StatusBadge status={z.status} color={z.statusColor} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary clocks grid */}
        <div className="mb-2">
          <div className="flex items-center gap-4 mb-3">
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, rgba(234,88,12,0.3), transparent)" }}
            />
            <span className="font-body text-xs tracking-[0.4em] text-orange-600/60 uppercase">
              AFFECTED REGIONS
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "linear-gradient(90deg, transparent, rgba(234,88,12,0.3))" }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
            {SECONDARY_ZONES.map((zone, i) => (
              <SecondaryClockCard
                key={zone.id}
                zone={zone}
                time={secondaryTimes[i].time}
                date={secondaryTimes[i].date}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="mt-6 px-4 md:px-8 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="font-body text-xs tracking-widest text-white/15 uppercase">
          GeoWatch · Real-time Geopolitical Monitor
        </span>
        <span className="font-mono text-xs text-white/15">
          v1.0 · {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
