// Minimal stroke icons for Black Belt app. All sized via props.
const Icon = ({ d, size = 20, stroke = 'currentColor', sw = 1.6, fill = 'none', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconChevronLeft  = (p) => <Icon {...p} d="M15 6l-6 6 6 6" />;
const IconChevronRight = (p) => <Icon {...p} d="M9 6l6 6-6 6" />;
const IconArrowRight   = (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />;
const IconArrowUpRight = (p) => <Icon {...p} d="M7 17L17 7M9 7h8v8" />;
const IconClose        = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
const IconCheck        = (p) => <Icon {...p} d="M5 12l4.5 4.5L19 7" />;
const IconHome         = (p) => <Icon {...p}><path d="M3 11l9-7 9 7M5 10v10h14V10" /></Icon>;
const IconCalendar     = (p) => <Icon {...p}><path d="M4 7h16v13H4zM4 7V5h16v2M8 3v4M16 3v4" /></Icon>;
const IconUser         = (p) => <Icon {...p}><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /><circle cx="12" cy="8" r="4" /></Icon>;
const IconUsers        = (p) => <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" /><path d="M16 6.5a3.5 3.5 0 010 7M22 20c0-3-2-5-5-5.5" /></Icon>;
const IconBolt         = (p) => <Icon {...p} d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />;
const IconFlame        = (p) => <Icon {...p} d="M12 3c1 4 5 5 5 10a5 5 0 11-10 0c0-3 2-4 2-7 1 1 2 2 3 -3z" />;
const IconQR           = (p) => <Icon {...p}><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3M20 14v3M14 17h3v4M20 20h1" /></Icon>;
const IconCopy         = (p) => <Icon {...p}><path d="M8 8h11v13H8zM5 16V3h11v3" /></Icon>;
const IconPlus         = (p) => <Icon {...p} d="M12 5v14M5 12h14" />;
const IconLocation     = (p) => <Icon {...p}><path d="M12 22s7-7 7-13a7 7 0 10-14 0c0 6 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></Icon>;
const IconClock        = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const IconSettings     = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" /></Icon>;
const IconShare        = (p) => <Icon {...p}><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M9 11l6-3M9 13l6 3" /></Icon>;
const IconSearch       = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></Icon>;
const IconBell         = (p) => <Icon {...p}><path d="M6 9a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8z" /><path d="M10 21h4" /></Icon>;
const IconCrown        = (p) => <Icon {...p} d="M3 18h18M3 8l4 4 5-7 5 7 4-4-2 10H5L3 8z" />;
const IconShield       = (p) => <Icon {...p} d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" />;

Object.assign(window, {
  IconChevronLeft, IconChevronRight, IconArrowRight, IconArrowUpRight, IconClose, IconCheck,
  IconHome, IconCalendar, IconUser, IconUsers, IconBolt, IconFlame, IconQR, IconCopy, IconPlus,
  IconLocation, IconClock, IconSettings, IconShare, IconSearch, IconBell, IconCrown, IconShield,
});
