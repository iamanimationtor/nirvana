"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MAX_CART_ITEM_QUANTITY } from "@/lib/constants";
import type { Product } from "@/lib/types";

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface WishItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface ToastState {
  id: number;
  text: string;
}

interface Flight {
  key: number;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  lift: number;
}

interface StoreValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (p: Product, qty?: number, source?: HTMLElement | null) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  quickView: Product | null;
  setQuickView: (p: Product | null) => void;
  wishlist: WishItem[];
  toggleWish: (p: Product) => void;
  isWished: (id: number) => boolean;
  toast: ToastState | null;
  notify: (text: string) => void;
  dropKey: number;
  badgeKey: number;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [dropKey, setDropKey] = useState(0);
  const [badgeKey, setBadgeKey] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toastId = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyKey = useRef(0);

  /* hydrate persisted state */
  useEffect(() => {
    const persistedCart = load<CartItem[]>("nirvana-cart", []);
    setItems(Array.isArray(persistedCart) ? persistedCart
      .filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isFinite(item.qty) && item.qty > 0)
      .map((item) => ({ ...item, qty: Math.min(Math.floor(item.qty), MAX_CART_ITEM_QUANTITY) })) : []);
    setWishlist(load<WishItem[]>("nirvana-wish", []));
    setTheme(load<"light" | "dark">("nirvana-theme", "light"));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("nirvana-cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem("nirvana-wish", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const applyTheme = useCallback((t: "light" | "dark") => {
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try {
      window.localStorage.setItem("nirvana-theme", JSON.stringify(t));
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }, [applyTheme]);

  const notify = useCallback((text: string) => {
    const id = ++toastId.current;
    setToast({ id, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /* scroll lock while an overlay is open */
  useEffect(() => {
    const locked = cartOpen || searchOpen || quickView !== null;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, searchOpen, quickView]);

  const finishAdd = useCallback(() => {
    setDropKey((k) => k + 1);
    notify("محصول به سبد خرید اضافه شد ✓");
  }, [notify]);

  const getCartAnchor = useCallback((): HTMLElement | null => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-cart-anchor]")
    );
    return (
      els.find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.top < window.innerHeight;
      }) ?? null
    );
  }, []);

  const add = useCallback(
    (p: Product, qty = 1, source?: HTMLElement | null) => {
      setItems((prev) => {
        const found = prev.find((i) => i.id === p.id);
        if (found) {
          return prev.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + qty, MAX_CART_ITEM_QUANTITY) } : i));
        }
        return [
          ...prev,
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.images[0] ?? "",
            qty: Math.min(qty, MAX_CART_ITEM_QUANTITY),
          },
        ];
      });
      setBadgeKey((k) => k + 1);

      if (source && !reduced) {
        const anchor = getCartAnchor();
        if (anchor) {
          const s = source.getBoundingClientRect();
          const t = anchor.getBoundingClientRect();
          const compact = window.innerWidth < 768;
          flyKey.current += 1;
          setFlight({
            key: flyKey.current,
            src: p.images[0] ?? "",
            x: s.left,
            y: s.top,
            w: Math.min(s.width, 220),
            h: Math.min(s.height, 220),
            dx: t.left + t.width / 2 - (s.left + s.width / 2),
            dy: t.top + t.height / 2 - (s.top + s.height / 2),
            lift: compact ? 60 : 130,
          });
          return;
        }
      }
      finishAdd();
    },
    [getCartAnchor, finishAdd, reduced]
  );

  const onFlightDone = useCallback(
    (key: number) => {
      if (flyKey.current !== key) return; // a newer flight superseded this one
      setFlight(null);
      finishAdd();
    },
    [finishAdd]
  );

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, MAX_CART_ITEM_QUANTITY) } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const toggleWish = useCallback(
    (p: Product) => {
      setWishlist((prev) => {
        const exists = prev.some((w) => w.id === p.id);
        notify(
          exists
            ? "از علاقه‌مندی‌ها حذف شد"
            : "به علاقه‌مندی‌ها اضافه شد ♥"
        );
        return exists
          ? prev.filter((w) => w.id !== p.id)
          : [
              ...prev,
              {
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                image: p.images[0] ?? "",
              },
            ];
      });
    },
    [notify]
  );

  const isWished = useCallback(
    (id: number) => wishlist.some((w) => w.id === id),
    [wishlist]
  );

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(
    () => items.reduce((s, i) => s + i.qty * i.price, 0),
    [items]
  );

  const value: StoreValue = useMemo(
    () => ({
      items,
      count,
      total,
      add,
      remove,
      setQty,
      clear,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      quickView,
      setQuickView,
      wishlist,
      toggleWish,
      isWished,
      toast,
      notify,
      dropKey,
      badgeKey,
      theme,
      toggleTheme,
    }),
    [
      items,
      count,
      total,
      add,
      remove,
      setQty,
      clear,
      cartOpen,
      searchOpen,
      quickView,
      wishlist,
      toggleWish,
      isWished,
      toast,
      notify,
      dropKey,
      badgeKey,
      theme,
      toggleTheme,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}

      {/* flying product clone */}
      <AnimatePresence>
        {flight && (
          <motion.img
            key={flight.key}
            src={flight.src}
            alt=""
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[220] rounded-[24px] object-cover shadow-2xl"
            style={{
              left: flight.x,
              top: flight.y,
              width: flight.w,
              height: flight.h,
              willChange: "transform",
            }}
            initial={{ scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              x: [0, flight.dx * 0.45, flight.dx],
              y: [0, flight.dy * 0.5 - flight.lift, flight.dy],
              scale: [1, 1.18, 0.2],
              rotate: [0, 10, 42],
              opacity: [1, 1, 0.85],
            }}
            transition={{
              duration: window.innerWidth < 768 ? 0.7 : 0.88,
              times: [0, 0.55, 1],
              ease: ["easeIn", "easeOut"],
            }}
            onAnimationComplete={() => onFlightDone(flight.key)}
          />
        )}
      </AnimatePresence>

      {/* toast */}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[240] flex justify-center px-4 md:bottom-10">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold text-ink"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-neon text-pine">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
