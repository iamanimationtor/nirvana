import type { ReactNode, SVGProps } from "react";

export type AdminIconName =
  | "activity"
  | "arrow"
  | "box"
  | "calendar"
  | "chart"
  | "check"
  | "chevron"
  | "close"
  | "cube"
  | "dashboard"
  | "document"
  | "download"
  | "edit"
  | "external"
  | "eye"
  | "inventory"
  | "lock"
  | "logout"
  | "menu"
  | "notification"
  | "orders"
  | "plus"
  | "search"
  | "settings"
  | "shield"
  | "store"
  | "trash"
  | "trend"
  | "users";

type Props = SVGProps<SVGSVGElement> & {
  name: AdminIconName;
};

export function AdminIcon({ name, ...props }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

const paths: Record<AdminIconName, ReactNode> = {
  activity: <><path d="M4 12h3l2-6 4 12 2-6h5" /></>,
  arrow: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M7.5 3v4M16.5 3v4M3.5 10h17" /></>,
  chart: <><path d="M4 19.5V5.5M4 19.5h16" /><path d="M8 16v-4M12 16V8M16 16V5" /></>,
  check: <><path d="m5 12 4.2 4L19 6.5" /></>,
  chevron: <><path d="m8 10 4 4 4-4" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  cube: <><path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4Z" /><path d="m3.8 7.4 8.2 4.7 8.2-4.7M12 12.1v9.1" /></>,
  dashboard: <><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.3" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.3" /><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.3" /><rect x="14" y="14" width="6.5" height="6.5" rx="1.3" /></>,
  document: <><path d="M7 3.5h7l3.5 3.5v13.5H7z" /><path d="M14 3.5V7h3.5M10 11h5M10 15h5" /></>,
  download: <><path d="M12 3v11" /><path d="m7.5 10 4.5 4.5 4.5-4.5" /><path d="M5 20h14" /></>,
  edit: <><path d="m4 20 4.2-1 10.1-10.1a2.4 2.4 0 0 0-3.4-3.4L4.8 15.6 4 20Z" /><path d="m13.5 6.8 3.7 3.7" /></>,
  external: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 13v5.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H11" /></>,
  eye: <><path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" /><circle cx="12" cy="12" r="2.2" /></>,
  inventory: <><path d="M4 7h16v12H4z" /><path d="M8 7V4h8v3M8 12h8" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></>,
  logout: <><path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" /><path d="M14 8l4 4-4 4M18 12H9" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  notification: <><path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  orders: <><path d="M5 5.5h14v15H5z" /><path d="M8.5 3.5v4M15.5 3.5v4M8.5 11h7M8.5 15h4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5.3v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" /></>,
  shield: <><path d="M12 3 4.5 6v5.7c0 4.5 3.1 7.7 7.5 9.3 4.4-1.6 7.5-4.8 7.5-9.3V6L12 3Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></>,
  store: <><path d="M4 10.5h16V20H4z" /><path d="m3.5 10.5 1.7-6h13.6l1.7 6" /><path d="M8 20v-5h8v5M3.5 10.5a2.5 2.5 0 0 0 4.5 1.5 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4.5-1.5" /></>,
  trash: <><path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 13h9.4l.8-13M10 11v5M14 11v5" /></>,
  trend: <><path d="M4 17 10 11l4 4 6-8" /><path d="M15.5 7H20v4.5" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.8-3.3 2.6-5 5.5-5s4.7 1.7 5.5 5" /><path d="M16 5.5a3 3 0 0 1 0 5.5M17 15.3c2 .5 3.2 2 3.5 4.7" /></>,
};
