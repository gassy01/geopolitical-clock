import { useState, useEffect, useCallback, useRef } from "react";

// ─── Timezone definitions ───────────────────────────────────────────────────
const PRIMARY_ZONE = {
  id: "primary",
  label: "WASHINGTON D.C.",
  sublabel: "UNITED STATES",
  timezone: "America/New_York",
  abbr: "EST/EDT",
  flag: "🇺🇸",
};

const SECONDARY_ZONES = [
  { id: "iran",      label: "TEHRAN",      sublabel: "IRAN",         timezone: "Asia/Tehran",    abbr: "IRST", flag: "🇮🇷", status: "HIGH ALERT",  statusColor: "#ff4444" },
  { id: "iraq",      label: "BAGHDAD",     sublabel: "IRAQ",         timezone: "Asia/Baghdad",   abbr: "AST",  flag: "🇮🇶", status: "ELEVATED",    statusColor: "#ff8800" },
  { id: "palestine", label: "JERUSALEM",   sublabel: "PALESTINE",    timezone: "Asia/Jerusalem", abbr: "EET",  flag: "🇵🇸", status: "HIGH ALERT",  statusColor: "#ff4444" },
  { id: "syria",     label: "DAMASCUS",    sublabel: "SYRIA",        timezone: "Asia/Damascus",  abbr: "EET",  flag: "🇸🇾", status: "HIGH ALERT",  statusColor: "#ff4444" },
  { id: "lebanon",   label: "BEIRUT",      sublabel: "LEBANON",      timezone: "Asia/Beirut",    abbr: "EET",  flag: "🇱🇧", status: "HIGH ALERT",  statusColor: "#ff4444" },
  { id: "jordan",    label: "AMMAN",       sublabel: "JORDAN",       timezone: "Asia/Amman",     abbr: "EET",  flag: "🇯🇴", status: "ELEVATED",    statusColor: "#ff8800" },
  { id: "saudi",     label: "RIYADH",      sublabel: "SAUDI ARABIA", timezone: "Asia/Riyadh",    abbr: "AST",  flag: "🇸🇦", status: "WATCHLIST",   statusColor: "#fbbf24" },
  { id: "uae",       label: "ABU DHABI",   sublabel: "UAE",          timezone: "Asia/Dubai",     abbr: "GST",  flag: "🇦🇪", status: "WATCHLIST",   statusColor: "#fbbf24" },
  { id: "qatar",     label: "DOHA",        sublabel: "QATAR",        timezone: "Asia/Qatar",     abbr: "AST",  flag: "🇶🇦", status: "WATCHLIST",   statusColor: "#fbbf24" },
  { id: "kuwait",    label: "KUWAIT CITY", sublabel: "KUWAIT",       timezone: "Asia/Kuwait",    abbr: "AST",  flag: "🇰🇼", status: "WATCHLIST",   statusColor: "#fbbf24" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function getTimeInZone(timezone) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date());
}

function getDateInZone(timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, weekday: "short", month: "short", day: "numeric", year: "numeric",
  }).format(new Date());
}

const TARGET_DATE = new Date("2026-04-22T20:00:00-04:00");

function getCountdown() {
  const diff = Math.max(0, Math.floor((TARGET_DATE - new Date()) / 1000));
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    total: diff,
  };
}

function pad(n) { return String(n).padStart(2, "0"); }

// ─── Sub-components ──────────────────────────────────────────────────────────

function LiveDot() {
  return (
    <div className="flex items-center gap-2">
      <div className="pulse-live rounded-full bg-red-600" style={{ width: "0.9vh", height: "0.9vh", boxShadow: "0 0 8px rgba(220,38,38,0.9)" }} />
      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.4vh", letterSpacing: "0.25em", color: "#ff5555", fontWeight: 700 }}>LIVE</span>
    </div>
  );
}

// ─── Primary Clock ───────────────────────────────────────────────────────────
function PrimaryClockCard({ zone, time, date }) {
  const [hh, mm, ss] = time.split(":");
  return (
    <div className="relative flicker overflow-hidden flex flex-col justify-center h-full"
      style={{ background: "linear-gradient(135deg,rgba(10,10,14,0.99) 0%,rgba(18,6,6,0.99) 100%)", border: "1px solid rgba(220,38,38,0.4)", boxShadow: "0 0 0 1px rgba(220,38,38,0.1), inset 0 0 40px rgba(220,38,38,0.04)", padding: "2vh 2.5vw" }}>
      {/* Corner marks */}
      {[["top-0 left-0","borderTop borderLeft"],["top-0 right-0","borderTop borderRight"],["bottom-0 left-0","borderBottom borderLeft"],["bottom-0 right-0","borderBottom borderRight"]].map(([pos]) => (
        <div key={pos} className={`absolute ${pos}`} style={{ width:"2.5vh", height:"2.5vh", borderTop: pos.includes("top") ? "2px solid rgba(220,38,38,0.8)" : undefined, borderBottom: pos.includes("bottom") ? "2px solid rgba(220,38,38,0.8)" : undefined, borderLeft: pos.includes("left") ? "2px solid rgba(220,38,38,0.8)" : undefined, borderRight: pos.includes("right") ? "2px solid rgba(220,38,38,0.8)" : undefined }} />
      ))}

      {/* Header row */}
      <div className="flex items-center justify-between" style={{ marginBottom: "1.5vh" }}>
        <div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "3vh" }}>{zone.flag}</span>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: "5.5vh", letterSpacing: "0.12em", color: "#ffffff", lineHeight: 1 }}>{zone.label}</span>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.6vh", letterSpacing: "0.3em", color: "rgba(255,120,120,0.9)", marginLeft: "4.5vh" }}>{zone.sublabel} · {zone.abbr}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <LiveDot />
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.3vh", letterSpacing: "0.25em", color: "rgba(255,100,100,0.85)" }}>PRIMARY</span>
        </div>
      </div>

      {/* Big clock */}
      <div className="flex items-baseline justify-center" style={{ gap: "1vw" }}>
        <span className="clock-digit glow-red" style={{ fontSize: "18vh", lineHeight: 1, color: "#ef4444", letterSpacing: "0.04em" }}>{hh}</span>
        <span className="clock-digit" style={{ fontSize: "15vh", lineHeight: 1, color: "rgba(220,38,38,0.45)", animation: "pulse-sep 1s step-end infinite" }}>:</span>
        <span className="clock-digit glow-red" style={{ fontSize: "18vh", lineHeight: 1, color: "#ef4444", letterSpacing: "0.04em" }}>{mm}</span>
        <span className="clock-digit" style={{ fontSize: "12vh", lineHeight: 1, color: "rgba(220,38,38,0.45)" }}>:</span>
        <span className="clock-digit" style={{ fontSize: "10vh", lineHeight: 1, color: "rgba(220,38,38,0.7)", letterSpacing: "0.04em" }}>{ss}</span>
      </div>

      {/* Date */}
      <div className="text-center" style={{ fontFamily: "'Barlow Condensed'", fontSize: "2vh", letterSpacing: "0.25em", color: "rgba(255,160,160,0.85)", marginTop: "1.5vh" }}>{date}</div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(220,38,38,0.6),transparent)" }} />
    </div>
  );
}

// ─── Countdown ───────────────────────────────────────────────────────────────
function CountdownPanel() {
  const [cd, setCd] = useState(getCountdown());
  useEffect(() => { const id = setInterval(() => setCd(getCountdown()), 1000); return () => clearInterval(id); }, []);
  const urgent = cd.total < 3600;

  return (
    <div className="relative flex flex-col justify-center h-full"
      style={{ background: urgent ? "linear-gradient(135deg,rgba(16,4,4,0.99),rgba(20,6,4,0.99))" : "linear-gradient(135deg,rgba(10,10,14,0.99),rgba(12,8,4,0.99))", border: urgent ? "1px solid rgba(220,38,38,0.6)" : "1px solid rgba(245,158,11,0.35)", padding: "2vh 2vw" }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: "4.5vh", letterSpacing: "0.15em", color: "#fbbf24", marginBottom: "0.5vh" }}>COUNTDOWN</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.4vh", letterSpacing: "0.25em", color: "rgba(251,191,36,0.7)", marginBottom: "2.5vh" }}>
        TARGET: 20:00 · 22 APR 2026 · WASHINGTON D.C.
      </div>

      {cd.total === 0 ? (
        <div className="clock-digit glow-red text-center" style={{ fontSize: "12vh", color: "#ef4444" }}>00:00:00</div>
      ) : (
        <div className="flex items-end" style={{ gap: "2.5vw" }}>
          {[{ val: cd.days, label: "DAYS" }, { val: cd.hours, label: "HRS" }, { val: cd.minutes, label: "MIN" }, { val: cd.seconds, label: "SEC" }].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className={`clock-digit ${urgent ? "glow-red" : "glow-amber"}`}
                style={{ fontSize: "14vh", lineHeight: 1, color: urgent ? "#ef4444" : "#f59e0b", letterSpacing: "0.05em" }}>
                {pad(item.val)}
              </span>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.6vh", letterSpacing: "0.25em", color: urgent ? "rgba(255,80,80,0.9)" : "rgba(251,191,36,0.85)", fontWeight: 700, marginTop: "0.5vh" }}>
                {item.label}
              </span>
            </div>
          ))}
          <div style={{ borderLeft: "1px solid rgba(245,158,11,0.4)", paddingLeft: "1.5vw", marginBottom: "0.5vh" }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.4vh", letterSpacing: "0.2em", color: "rgba(245,158,11,0.6)" }}>UNTIL</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.8vh", letterSpacing: "0.2em", color: "#fbbf24", fontWeight: 700 }}>APR 22</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Secondary Clock Card ─────────────────────────────────────────────────────
function SecondaryCard({ zone, time, date }) {
  const [hh, mm, ss] = time.split(":");
  return (
    <div className="relative flex flex-col justify-center h-full secondary-border-glow"
      style={{ background: "linear-gradient(135deg,rgba(10,10,14,0.97),rgba(12,10,8,0.97))", border: "1px solid rgba(234,88,12,0.25)", padding: "1vh 0.8vw", overflow: "hidden" }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(234,88,12,0.6),transparent)" }} />

      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: "0.8vh" }}>
        <div className="flex items-center" style={{ gap: "0.4vw" }}>
          <span style={{ fontSize: "2.2vh" }}>{zone.flag}</span>
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: "2.8vh", letterSpacing: "0.1em", color: "#ffffff", lineHeight: 1.1 }}>{zone.label}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.3vh", letterSpacing: "0.2em", color: "rgba(255,160,100,0.9)" }}>{zone.sublabel}</div>
          </div>
        </div>
        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.3vh", letterSpacing: "0.15em", color: zone.statusColor, fontWeight: 700, textAlign: "right", paddingTop: "0.2vh" }}>
          {zone.status}
        </span>
      </div>

      {/* Clock */}
      <div className="flex items-baseline" style={{ gap: "0.2vw" }}>
        <span className="clock-digit glow-orange" style={{ fontSize: "7vh", lineHeight: 1, color: "#ea580c", letterSpacing: "0.03em" }}>{hh}</span>
        <span className="clock-digit" style={{ fontSize: "5.5vh", lineHeight: 1, color: "rgba(234,88,12,0.45)" }}>:</span>
        <span className="clock-digit glow-orange" style={{ fontSize: "7vh", lineHeight: 1, color: "#ea580c", letterSpacing: "0.03em" }}>{mm}</span>
        <span className="clock-digit" style={{ fontSize: "5.5vh", lineHeight: 1, color: "rgba(234,88,12,0.45)" }}>:</span>
        <span className="clock-digit" style={{ fontSize: "3.8vh", lineHeight: 1, color: "rgba(234,88,12,0.65)" }}>{ss}</span>
      </div>

      {/* Date */}
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.3vh", letterSpacing: "0.15em", color: "rgba(255,160,80,0.8)", marginTop: "0.4vh" }}>{date}</div>
    </div>
  );
}

// ─── DEFCON Bar ───────────────────────────────────────────────────────────────
function DefconBar() {
  return (
    <div className="flex items-center" style={{ gap: "1.2vw", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.4)", padding: "0.8vh 1.5vw" }}>
      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.8vh", letterSpacing: "0.3em", color: "rgba(255,100,100,0.95)", fontWeight: 700 }}>DEFCON WATCH</span>
      <div className="flex items-center" style={{ gap: "0.5vw" }}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="flex items-center justify-center"
            style={{ width: "3.2vh", height: "3.2vh", background: level <= 3 ? (level === 1 ? "rgba(220,38,38,0.95)" : level === 2 ? "rgba(234,88,12,0.9)" : "rgba(245,158,11,0.8)") : "rgba(255,255,255,0.08)", border: level <= 3 ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.15)" }}>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: "1.6vh", fontWeight: 700, color: "#fff" }}>{level}</span>
          </div>
        ))}
      </div>
      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.8vh", letterSpacing: "0.2em", color: "rgba(251,146,60,0.95)", fontWeight: 700 }}>ELEVATED</span>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [tick, setTick] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const appRef = useRef(null);

  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 1000); return () => clearInterval(id); }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try { await appRef.current?.requestFullscreen(); setIsFullscreen(true); } catch (e) { console.error(e); }
    } else { await document.exitFullscreen(); setIsFullscreen(false); }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const primaryTime = getTimeInZone(PRIMARY_ZONE.timezone);
  const primaryDate = getDateInZone(PRIMARY_ZONE.timezone);
  const secondaryTimes = SECONDARY_ZONES.map((z) => ({ time: getTimeInZone(z.timezone), date: getDateInZone(z.timezone) }));
  const utcTime = new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());

  return (
    <div ref={appRef} style={{ width: "100vw", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", background: "radial-gradient(ellipse at 20% 20%,rgba(60,8,8,0.2) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(40,16,4,0.12) 0%,transparent 50%),#080a0c", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E\")" }}>

      {/* HEADER */}
      <header style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.8vh 2vw", background: "rgba(8,10,12,0.97)", borderBottom: "1px solid rgba(220,38,38,0.3)", backdropFilter: "blur(10px)" }}>
        <div className="flex items-center" style={{ gap: "1.5vw" }}>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "3.5vh", letterSpacing: "0.3em", color: "#ef4444" }}>
            GEO<span style={{ color: "#ffffff" }}>WATCH</span>
          </span>
          <div style={{ width: "1px", height: "3vh", background: "rgba(220,38,38,0.4)" }} />
          <LiveDot />
        </div>
        <div className="flex items-center" style={{ gap: "2vw" }}>
          <div className="flex items-center" style={{ gap: "0.5vw" }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.6vh", letterSpacing: "0.2em", color: "rgba(255,255,255,0.65)" }}>UTC</span>
            <span className="clock-digit" style={{ fontSize: "2vh", color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em" }}>{utcTime}</span>
          </div>
          <button onClick={toggleFullscreen}
            style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.5vh", letterSpacing: "0.2em", background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.4)", color: "rgba(220,38,38,0.9)", padding: "0.5vh 1vw", cursor: "pointer" }}>
            {isFullscreen ? "EXIT" : "FULLSCREEN"}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0.8vh 0.8vw", gap: "0.8vh", overflow: "hidden" }}>

        {/* DEFCON bar */}
        <DefconBar />

        {/* Top row: Primary clock + Countdown */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "0.8vw", flex: "0 0 auto", height: "38vh" }}>
          <PrimaryClockCard zone={PRIMARY_ZONE} time={primaryTime} date={primaryDate} />
          <CountdownPanel />
        </div>

        {/* AFFECTED REGIONS divider */}
        <div className="flex items-center" style={{ gap: "1vw", flexShrink: 0 }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(234,88,12,0.7),transparent)" }} />
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: "1.8vh", letterSpacing: "0.45em", color: "rgba(251,146,60,0.95)", fontWeight: 700 }}>AFFECTED REGIONS</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,transparent,rgba(234,88,12,0.7))" }} />
        </div>

        {/* Secondary 10 clocks — 5 cols × 2 rows fills remaining height */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gridTemplateRows: "repeat(2,1fr)", gap: "0.5vw", overflow: "hidden" }}>
          {SECONDARY_ZONES.map((zone, i) => (
            <SecondaryCard key={zone.id} zone={zone} time={secondaryTimes[i].time} date={secondaryTimes[i].date} />
          ))}
        </div>
      </main>

      {/* CRT scanline overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)" }} />
    </div>
  );
}
