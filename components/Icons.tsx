type P = { size?: number };
const base = (size = 16) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, "aria-hidden": true,
});
export const SearchIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const HeartIcon = ({ size }: P) => (<svg {...base(size)}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>);
export const BagIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>);
export const UserIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>);
export const ArrowIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const CalendarIcon = ({ size }: P) => (<svg {...base(size)}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>);

export const ChevronIcon = ({ size }: P) => (<svg {...base(size)}><path d="m6 9 6 6 6-6" /></svg>);
export const CloseIcon = ({ size }: P) => (<svg {...base(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const GridIcon = ({ size }: P) => (<svg {...base(size)}><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>);
export const RowsIcon = ({ size }: P) => (<svg {...base(size)}><rect x="4" y="4" width="16" height="7" /><rect x="4" y="14" width="16" height="7" /></svg>);

export const ZoomIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></svg>);
export const StarIcon = ({ size }: P) => (<svg {...base(size)}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /></svg>);
export const PlusIcon = ({ size }: P) => (<svg {...base(size)}><path d="M12 5v14M5 12h14" /></svg>);
export const MinusIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 12h14" /></svg>);
export const CheckIcon = ({ size }: P) => (<svg {...base(size)}><path d="m5 12 5 5 9-10" /></svg>);
export const RulerIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 17 17 3l4 4L7 21l-4-4Z" /><path d="m7 13 2 2M10 10l2 2M13 7l2 2" /></svg>);

export const GiftIcon = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="8" width="18" height="4" /><path d="M5 12v8h14v-8M12 8v12M12 8S10 3.5 7.5 5 9 8 12 8Zm0 0s2-4.5 4.5-3S15 8 12 8Z" /></svg>);
export const LockIcon = ({ size }: P) => (<svg {...base(size)}><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
export const LeafIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z" /><path d="M5 19c3-4 6-7 10-9" /></svg>);
export const ReturnIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" /><path d="M20 4v5h-5M4 20v-5h5" /></svg>);

export const ChatIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" /></svg>);
export const KeyIcon = ({ size }: P) => (<svg {...base(size)}><circle cx="8" cy="12" r="3.5" /><path d="M11.5 12H21M17 12v3M20 12v2" /></svg>);
export const TruckIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>);
export const ShieldIcon = ({ size }: P) => (<svg {...base(size)}><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>);
export const CashIcon = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="7" width="18" height="11" rx="1.5" /><circle cx="12" cy="12.5" r="2.5" /><path d="M6 10v5M18 10v5" /></svg>);
export const SendIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 11 21 4l-7 17-3-7-8-3Z" /></svg>);
export const HeadsetIcon = ({ size }: P) => (<svg {...base(size)}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /><path d="M20 20c0 1.5-2 2-5 2" /></svg>);
export const EyeIcon = ({ size }: P) => (<svg {...base(size)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
export const EyeOffIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 3l18 18M10.6 6.2A9.6 9.6 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7c1.5 0 2.9-.4 4.1-.9" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>);

export const BellIcon = ({ size }: P) => (<svg {...base(size)}><path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15L6 17Z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>);
export const BoxIcon = ({ size }: P) => (<svg {...base(size)}><path d="M3 8l9-5 9 5v8l-9 5-9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>);
export const FabricIcon = ({ size }: P) => (<svg {...base(size)}><path d="M5 4h10l4 4v12H5V4Z" /><path d="M15 4v4h4" /><path d="M8 13c1.5-1.5 2.5 1.5 4 0s2.5 1.5 4 0" /></svg>);

export const MailIcon = ({ size }: P) => (<svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
