"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  IconCart,
  IconHeart,
  IconLeaf,
  IconMoon,
  IconSearch,
  IconSun,
  IconUser,
} from "./Icons";
import WishPanel from "./WishPanel";
import { useAuth } from "./AuthProvider";
import { useStore } from "@/store/store";
import { faNumber } from "@/lib/format";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/#categories", label: "دسته‌بندی‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3" data-cursor-target>
      <span className="glass glass-hover relative grid h-11 w-11 place-items-center rounded-2xl text-forest transition-transform duration-500 group-hover:-rotate-6 dark:text-neon">
        <IconLeaf className="h-5 w-5" />
        <span className="absolute -bottom-0.5 -left-0.5 h-2 w-2 rounded-full bg-neon shadow-[0_0_8px_rgba(163,245,90,.9)]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight">نیروانا</span>
        <span className="font-latin mt-1 text-[9px] font-medium text-inksoft">
          NIRVANA 3D
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const {
    count,
    setCartOpen,
    setSearchOpen,
    badgeKey,
    dropKey,
    theme,
    toggleTheme,
    wishlist,
  } = useStore();
  const { user } = useAuth();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  const cartControls = useAnimationControls();
  const prevDrop = useRef(0);
  useEffect(() => {
    if (dropKey > 0 && dropKey !== prevDrop.current) {
      prevDrop.current = dropKey;
      cartControls.start({
        scale: [1, 1.24, 0.92, 1.08, 1],
        transition: { duration: 0.75, times: [0, 0.3, 0.55, 0.8, 1] },
      });
    }
  }, [dropKey, cartControls]);

  return (
    <header className="fixed inset-x-0 top-0 z-[120]">
      <div className="container-x pt-3">
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={
            "flex items-center justify-between gap-3 rounded-full px-3 py-2.5 transition-all duration-500 md:px-4 " +
            (scrolled
              ? "glass shadow-soft"
              : "border border-transparent bg-transparent")
          }
        >
          <Logo />

          {/* desktop links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => {
              const base = l.href.split("#")[0];
              const active =
                pathname === base && base !== "/"
                  ? true
                  : pathname === "/" && l.href === "/";
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    "relative rounded-full px-4 py-2.5 text-sm font-bold transition-colors duration-300 " +
                    (active
                      ? "text-ink"
                      : "text-inksoft hover:text-ink")
                  }
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-ink/6 dark:bg-ivory/10"
                      style={{ background: "color-mix(in srgb, var(--ink) 7%, transparent)" }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* utilities */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ y: -3, scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              aria-label="تغییر تم"
              className="glass glass-hover glass-icon hidden text-ink sm:grid"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.35 }}
                  className="grid place-items-center"
                >
                  {theme === "dark" ? (
                    <IconSun className="h-5 w-5 text-gold" />
                  ) : (
                    <IconMoon className="h-5 w-5 text-forest dark:text-neon" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ y: -3, scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSearchOpen(true)}
              aria-label="جستجو"
              className="glass glass-hover glass-icon text-ink"
            >
              <IconSearch className="h-5 w-5" />
            </motion.button>

            <div className="relative hidden sm:block">
              <motion.button
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setWishOpen((v) => !v)}
                aria-label="علاقه‌مندی‌ها"
                className={
                  "glass glass-hover glass-icon relative text-ink " +
                  (wishOpen ? "border-neon/60" : "")
                }
              >
                <IconHeart
                  className="h-5 w-5"
                  filled={wishlist.length > 0}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -end-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-gold px-1 text-[10px] font-extrabold text-pine">
                    {faNumber(wishlist.length)}
                  </span>
                )}
              </motion.button>
              <AnimatePresence>
                {wishOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setWishOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute end-0 top-full z-20 mt-3 w-80"
                    >
                      <WishPanel onClose={() => setWishOpen(false)} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link href={user ? "/account" : "/login"} aria-label="حساب کاربری">
              <motion.span
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ scale: 0.92 }}
                className="glass glass-hover glass-icon relative hidden text-ink sm:grid"
              >
                <IconUser className="h-5 w-5" />
                {user && (
                  <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_8px_rgba(163,245,90,.9)]" />
                )}
              </motion.span>
            </Link>

            {/* cart */}
            <div className="relative">
              <AnimatePresence>
                {dropKey > 0 && (
                  <motion.span
                    key={dropKey}
                    initial={{ scale: 0.7, opacity: 0.9 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0 rounded-full border-2 border-neon"
                  />
                )}
              </AnimatePresence>
              <motion.button
                animate={cartControls}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCartOpen(true)}
                aria-label="سبد خرید"
                data-cart-anchor
                className="glass glass-hover glass-icon relative text-ink"
              >
                <IconCart className="h-5 w-5" />
                <AnimatePresence mode="popLayout">
                  {count > 0 && (
                    <motion.span
                      key={badgeKey}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.3, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-neon px-1 text-[10px] font-extrabold text-pine shadow-[0_0_12px_rgba(163,245,90,.7)]"
                    >
                      {faNumber(count)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
