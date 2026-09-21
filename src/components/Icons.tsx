import type { ReactElement, SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...p }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...p}
    >
      {children}
    </svg>
  );
}

export const IconCart = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h2l2.3 10.3a1.6 1.6 0 0 0 1.56 1.2h6.6a1.6 1.6 0 0 0 1.56-1.2L19.8 10H7" />
    <circle cx="10.2" cy="21" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="16.6" cy="21" r="0.9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconHeart = (p: P & { filled?: boolean }) => {
  const { filled, ...rest } = p;
  return (
    <Svg {...rest} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20.3 4.8 13a4.7 4.7 0 0 1 0-6.6 4.5 4.5 0 0 1 6.5 0l.7.7.7-.7a4.5 4.5 0 0 1 6.5 0 4.7 4.7 0 0 1 0 6.6Z" />
    </Svg>
  );
};

export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.6-4.6" />
  </Svg>
);

export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.6-3.4 4.3-5 7.5-5s5.9 1.6 7.5 5" />
  </Svg>
);

export const IconSun = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" />
  </Svg>
);

export const IconMoon = (p: P) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Svg>
);

export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMinus = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

/* RTL "forward" points to the left */
export const IconArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l.8 12a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5l.8-12M10 11v6M14 11v6" />
  </Svg>
);

export const IconZoom = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.6-4.6M8.5 11h5M11 8.5v5" />
  </Svg>
);

export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const IconBox = (p: P) => (
  <Svg {...p}>
    <path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.6V7.4Z" />
    <path d="M4 7.4 12 12l8-4.6M12 12v9.2" />
  </Svg>
);

export const IconShield = (p: P) => (
  <Svg {...p}>
    <path d="M12 2.8 4.5 5.6v6c0 4.6 3.2 7.8 7.5 9.6 4.3-1.8 7.5-5 7.5-9.6v-6Z" />
    <path d="m8.8 11.8 2.2 2.2 4.2-4.2" />
  </Svg>
);

export const IconTruck = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 6.5h11v10h-11zM13.5 10h4.2l3 3.4v3.1h-3" />
    <circle cx="7" cy="17.8" r="1.8" />
    <circle cx="16.8" cy="17.8" r="1.8" />
  </Svg>
);

export const IconSend = (p: P) => (
  <Svg {...p}>
    <path d="M21 3.5 3 10.8l6.8 2.7L12.5 20Z" />
    <path d="M21 3.5 9.8 13.5" />
  </Svg>
);

/* ── category icons ── */

export const IconFigure = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.2c3.2 0 5.4 2 5.4 5.2 0 2.2-.7 3.9-1.6 5-.9 1-.9 1.6-.9 2.4h-5.8c0-.8 0-1.4-.9-2.4-.9-1.1-1.6-2.8-1.6-5 0-3.2 2.2-5.2 5.4-5.2Z" />
    <path d="M9 19h6M7.5 21.5h9" />
    <path d="M9.4 8.2c.8-.9 1.7-1.3 2.6-1.3s1.8.4 2.6 1.3" />
  </Svg>
);

export const IconVase = (p: P) => (
  <Svg {...p}>
    <path d="M9 3.5h6c-.3 1.8-.2 3 .4 4.4.9 2 .6 3.6-.2 5.4-.7 1.7-.8 3.3.8 5.2.5.6.2 2-2 2h-4c-2.2 0-2.5-1.4-2-2 1.6-1.9 1.5-3.5.8-5.2-.8-1.8-1.1-3.4-.2-5.4.6-1.4.7-2.6.4-4.4Z" />
    <path d="M9 6.5h6" />
  </Svg>
);

export const IconLamp = (p: P) => (
  <Svg {...p}>
    <path d="M7.5 13.5a4.5 4.5 0 1 1 9 0" />
    <path d="M8.5 16h7M12 13.5V16M10 19h4M12 16v3" />
    <path d="M4.5 9.5 3 9M21 9l-1.5.5M12 3.5V2" />
  </Svg>
);

export const IconStand = (p: P) => (
  <Svg {...p}>
    <rect x="6.5" y="4" width="11" height="7.5" rx="1.2" />
    <path d="M9 11.5v3a3 3 0 0 0 3 3h4.5" />
    <path d="M7.5 20.5h6" />
  </Svg>
);

export const IconGamepad = (p: P) => (
  <Svg {...p}>
    <path d="M7.5 7h9a5.5 5.5 0 0 1 5.4 6.6l-.5 2.3a2.9 2.9 0 0 1-5 1.2l-1-1.1a2 2 0 0 0-1.5-.6h-3.8a2 2 0 0 0-1.5.6l-1 1.1a2.9 2.9 0 0 1-5-1.2l-.5-2.3A5.5 5.5 0 0 1 7.5 7Z" />
    <path d="M8.5 10v3M7 11.5h3" />
    <circle cx="16" cy="10.5" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="18" cy="12.5" r="0.7" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconSpark = (p: P) => (
  <Svg {...p}>
    <path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5Z" />
    <path d="M18.5 15.5c.3 2.2 1 2.9 3.2 3.2-2.2.3-2.9 1-3.2 3.2-.3-2.2-1-2.9-3.2-3.2 2.2-.3 2.9-1 3.2-3.2Z" />
  </Svg>
);

/* ── brand / social ── */

export const IconInstagram = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconTelegram = (p: P) => (
  <Svg {...p}>
    <path d="m21 4.5-3.2 15c-.1.6-.8.8-1.3.4l-4.4-3.2-2.1 2c-.4.4-1 .2-1.2-.3L7 14.6 3.3 12c-.5-.4-.4-1.2.3-1.4L20 4.2c.6-.2 1.2.3 1 1.1Z" />
    <path d="m19.8 4.8-8.6 7.9" />
    <path d="m11.2 12.7 3.4 2.6" />
  </Svg>
);

/* stylized leaf — the brand motif */
export const IconLeaf = (p: P) => (
  <Svg {...p}>
    <path d="M12 21C7 16.5 5.5 11 8 5.5 13 4 18 5.5 19.5 9.5c1.4 4-1 8.5-7.5 11.5Z" />
    <path d="M12 21c-1-5 0-9.5 4.5-13.5" />
  </Svg>
);

export const IconHome = (p: P) => (
  <Svg {...p}>
    <path d="m4 10.5 8-7 8 7V19a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 19Z" />
    <path d="M9.5 20.5v-6h5v6" />
  </Svg>
);

export const IconStore = (p: P) => (
  <Svg {...p}>
    <path d="M4 9.5v9.2a1.8 1.8 0 0 0 1.8 1.8h12.4a1.8 1.8 0 0 0 1.8-1.8V9.5" />
    <path d="M3 9.5 5.2 4h13.6L21 9.5" />
    <path d="M3 9.5a3 3 0 0 0 4.5 2.6A3 3 0 0 0 12 9.5a3 3 0 0 0 4.5 2.6A3 3 0 0 0 21 9.5" />
    <path d="M9.5 20.5v-5h5v5" />
  </Svg>
);

export const IconMenu = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h10M4 17h16" />
  </Svg>
);

export const CATEGORY_ICONS: Record<string, (p: P) => ReactElement> = {
  figure: IconFigure,
  vase: IconVase,
  lamp: IconLamp,
  stand: IconStand,
  gamepad: IconGamepad,
  spark: IconSpark,
};
