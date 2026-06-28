/* ============================================================================
   Cargo glyphs — premium SVG/CSS freight elements used across stages and the
   registry. Containers, the AI inspection machine, the reward vault.
   ========================================================================== */

/** A sealed shipping container with a barcode and a closed lock. */
export function SealedContainer({
  size = 130,
  color = "var(--color-sealed)",
  accent = "var(--color-safety)",
  locked = true,
}: {
  size?: number;
  color?: string;
  accent?: string;
  locked?: boolean;
}) {
  return (
    <svg width={size} height={(size * 0.72) | 0} viewBox="0 0 130 94">
      <rect x="6" y="10" width="118" height="74" rx="3" fill={color} stroke={accent} strokeOpacity="0.6" strokeWidth="2" />
      {/* corrugation */}
      <g stroke="#000" strokeOpacity="0.28" strokeWidth="2">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1={16 + i * 10} y1="14" x2={16 + i * 10} y2="80" />
        ))}
      </g>
      {/* barcode plate */}
      <rect x="20" y="58" width="50" height="16" rx="1.5" fill="#0b0d0e" stroke={accent} strokeOpacity="0.5" />
      <g stroke={accent} strokeWidth="1.2">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1={24 + i * 3.2} y1="61" x2={24 + i * 3.2} y2="71" strokeOpacity={i % 3 ? 0.9 : 0.5} />
        ))}
      </g>
      {/* lock */}
      <g transform="translate(92 50)">
        <rect x="-10" y="0" width="20" height="16" rx="2" fill={accent} fillOpacity={locked ? 0.9 : 0.3} />
        <path d="M-6 0 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke={accent} strokeWidth="2.4" strokeOpacity={locked ? 1 : 0.4} />
      </g>
    </svg>
  );
}

/** An opened container — doors swung out, contents visible. */
export function OpenContainer({
  size = 130,
  color = "var(--color-teal)",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={(size * 0.72) | 0} viewBox="0 0 130 94">
      <rect x="34" y="14" width="64" height="66" rx="2" fill="#0b0d0e" stroke={color} strokeOpacity="0.5" strokeWidth="2" />
      <g stroke={color} strokeOpacity="0.5" strokeWidth="1.4">
        <line x1="44" y1="26" x2="88" y2="26" />
        <line x1="44" y1="36" x2="88" y2="36" />
        <line x1="44" y1="46" x2="76" y2="46" />
      </g>
      {/* open doors */}
      <rect x="6" y="10" width="20" height="74" rx="2" fill="var(--color-iron)" stroke={color} strokeOpacity="0.7" strokeWidth="2" transform="skewY(-8)" />
      <rect x="104" y="10" width="20" height="74" rx="2" fill="var(--color-iron)" stroke={color} strokeOpacity="0.7" strokeWidth="2" transform="skewY(8)" />
      <circle cx="65" cy="47" r="30" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="1.5" className="bc-pulse" style={{ color }} />
    </svg>
  );
}

/** A rejected container — alarm stripe + X. */
export function RejectedContainer({ size = 130 }: { size?: number }) {
  const alarm = "var(--color-alarm)";
  return (
    <svg width={size} height={(size * 0.72) | 0} viewBox="0 0 130 94" className="bc-shake">
      <rect x="6" y="10" width="118" height="74" rx="3" fill="var(--color-iron)" stroke={alarm} strokeOpacity="0.7" strokeWidth="2" />
      <rect x="6" y="38" width="118" height="18" className="hazard-alarm" opacity="0.5" />
      <path d="M44 30 L86 64 M86 30 L44 64" stroke={alarm} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** The AI batch inspection machine — fills with fuel, beams Electric Blue. */
export function InspectionMachine({
  size = 200,
  power = 0,
  scanning = false,
}: {
  size?: number;
  power?: number; // 0..1
  scanning?: boolean;
}) {
  const ai = "var(--color-ai)";
  return (
    <svg width={size} height={(size * 0.6) | 0} viewBox="0 0 200 120">
      {/* machine body */}
      <rect x="20" y="20" width="160" height="80" rx="6" fill="var(--color-iron)" stroke={ai} strokeOpacity="0.5" strokeWidth="2" />
      {/* tunnel mouth */}
      <rect x="0" y="46" width="26" height="28" rx="2" fill="#0b0d0e" stroke={ai} strokeOpacity="0.4" />
      <rect x="174" y="46" width="26" height="28" rx="2" fill="#0b0d0e" stroke={ai} strokeOpacity="0.4" />
      {/* power gauge */}
      <rect x="36" y="34" width="128" height="10" rx="2" fill="#0b0d0e" stroke={ai} strokeOpacity="0.4" />
      <rect x="38" y="36" width={124 * Math.max(0, Math.min(1, power))} height="6" rx="1" fill={ai} style={{ transition: "width 0.6s ease" }} />
      {/* status lights */}
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx={48 + i * 26} cy="64" r="5" fill={ai} fillOpacity={power > i / 5 ? 0.9 : 0.15} className={scanning ? "bc-blink" : ""} style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
      {/* scan beam */}
      {scanning && (
        <g>
          <rect x="26" y="22" width="148" height="76" fill="url(#beam)" opacity="0.5" />
          <defs>
            <linearGradient id="beam" x1="0" x2="1">
              <stop offset="0%" stopColor={ai} stopOpacity="0" />
              <stop offset="50%" stopColor={ai} stopOpacity="0.5" />
              <stop offset="100%" stopColor={ai} stopOpacity="0" />
            </linearGradient>
          </defs>
        </g>
      )}
      <rect x="36" y="78" width="128" height="14" rx="2" fill="#0b0d0e" stroke={ai} strokeOpacity="0.3" />
      <text x="100" y="89" textAnchor="middle" fontSize="9" fill={ai} fillOpacity="0.8" fontFamily="monospace" letterSpacing="2">
        RITUAL · AI
      </text>
    </svg>
  );
}

/** The reward vault — closed, charged, or open with bullion glow. */
export function RewardVault({
  size = 150,
  charged = true,
  open = false,
}: {
  size?: number;
  charged?: boolean;
  open?: boolean;
}) {
  const gold = "var(--color-bullion)";
  return (
    <svg width={size} height={size} viewBox="0 0 150 150" className={charged ? "bc-vault" : ""}>
      <rect x="20" y="20" width="110" height="110" rx="8" fill="var(--color-iron)" stroke={gold} strokeOpacity="0.55" strokeWidth="2.5" />
      <circle cx="75" cy="75" r="34" fill="#0b0d0e" stroke={gold} strokeOpacity="0.6" strokeWidth="2" />
      <circle cx="75" cy="75" r="20" fill={gold} fillOpacity={charged ? 0.4 : 0.12} />
      {/* dial */}
      <g className={open ? "" : "bc-spin"} style={{ transformOrigin: "75px 75px" }}>
        <line x1="75" y1="75" x2="75" y2="52" stroke={gold} strokeWidth="3" strokeLinecap="round" />
        <line x1="75" y1="75" x2="93" y2="86" stroke={gold} strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="75" cy="75" r="5" fill={gold} />
      {open && <rect x="20" y="20" width="110" height="110" rx="8" fill="none" stroke={gold} strokeWidth="2" className="bc-vault" />}
    </svg>
  );
}
