import { motion } from "framer-motion";

export default function AnimatedHero() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      className="mx-auto w-full max-w-xl"
      transition={{ duration: 5.4, ease: "easeInOut", repeat: Infinity }}
    >
      <svg className="h-auto w-full" viewBox="0 0 520 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="deskGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>
          <linearGradient id="screenGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
          <linearGradient id="chartGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#a5f3fc" />
          </linearGradient>
        </defs>

        <g className="float-slow">
          <circle cx="88" cy="92" fill="#bae6fd" r="44" />
          <rect fill="#fff" height="30" rx="9" width="56" x="60" y="76" />
          <rect fill="#22d3ee" height="7" rx="3.5" width="28" x="74" y="87" />
        </g>

        <g className="float-fast">
          <circle cx="430" cy="98" fill="#fbcfe8" r="44" />
          <rect fill="#fff" height="30" rx="9" width="56" x="402" y="82" />
          <path d="M414 97h32" stroke="#fb7185" strokeLinecap="round" strokeWidth="4.5" />
        </g>

        <rect fill="url(#deskGradient)" height="128" rx="30" width="404" x="58" y="224" />
        <rect fill="#f8fafc" height="20" rx="10" width="186" x="167" y="238" />

        <rect fill="#1e293b" height="96" rx="16" width="130" x="197" y="129" />
        <rect fill="url(#screenGradient)" height="78" rx="10" width="116" x="204" y="137" />
        <rect fill="#334155" height="12" rx="6" width="80" x="223" y="226" />

        <g>
          <circle cx="260" cy="126" fill="#fbcfe8" r="30" />
          <circle cx="260" cy="122" fill="#fde68a" r="23" />
          <path
            d="M210 206c8-35 30-58 50-58s42 23 50 58"
            fill="#a7f3d0"
            stroke="#34d399"
            strokeWidth="3"
          />
          <rect fill="#e2e8f0" height="16" rx="8" width="58" x="186" y="212" />
          <rect fill="#e2e8f0" height="16" rx="8" width="58" x="278" y="212" />
        </g>

        <g className="float-slow">
          <rect fill="url(#chartGradient)" height="62" rx="12" width="84" x="76" y="172" />
          <path d="M90 193h56" stroke="#0f766e" strokeLinecap="round" strokeWidth="5" />
          <path d="M90 210h36" stroke="#0f766e" strokeLinecap="round" strokeWidth="5" />
        </g>

        <g>
          <circle cx="382" cy="168" fill="#fff" r="40" stroke="#c4b5fd" strokeWidth="8" />
          <line
            className="clock-hand"
            stroke="#8b5cf6"
            strokeLinecap="round"
            strokeWidth="4"
            x1="382"
            x2="382"
            y1="168"
            y2="140"
          />
          <line stroke="#6366f1" strokeLinecap="round" strokeWidth="4" x1="382" x2="401" y1="168" y2="168" />
          <circle cx="382" cy="168" fill="#6366f1" r="4" />
        </g>
      </svg>
    </motion.div>
  );
}
