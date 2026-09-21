"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  IconCart,
  IconHeart,
  IconHome,
  IconSearch,
  IconStore,
} from "./Icons";
import WishPanel from "./WishPanel";
import { faNumber } from "@/lib/format";
import { useStore } from "@/store/store";

export default function MobileNav() {
  const pathname = usePathname();
  const { count, setCartOpen, setSearchOpen, wishlist } = useStore();
  const [wishOpen, setWishOpen] = useState(false);

  const item = (active: boolean) =>
    "relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-extrabold transition-colors duration-300 " +
    (active ? "text-forest dark:text-neon" : "text-inksoft");

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-[110] px-3 pb-3 md:hidden">
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.4 }}
          className="glass flex items-end justify-around rounded-[26px] px-2 py-2 shadow-deep"
        >
          <Link href="/" className={item(pathname === "/")}>
            <IconHome className="h-5 w-5" />
            خانه
            <NavIndicator active={pathname === "/"} />
          </Link>

          <Link href="/shop" className={item(pathname.startsWith("/shop"))}>
            <IconStore className="h-5 w-5" />
            فروشگاه
            <NavIndicator active={pathname.startsWith("/shop")} />
          </Link>

          {/* Keeps a fifth flex slot while the control itself is positioned against the shared icon row. */}
          <span className="h-14 w-14 shrink-0" aria-hidden />
          <div className="absolute left-1/2 -top-2.5 z-10 -translate-x-1/2">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              aria-label="جستجو"
              className="glass grid h-14 w-14 place-items-center rounded-full text-forest shadow-soft dark:text-neon"
            >
              <IconSearch className="h-6 w-6" />
            </motion.button>
          </div>

          <div className="relative">
            <button
              onClick={() => setWishOpen((v) => !v)}
              className={item(wishOpen)}
              aria-label="علاقه‌مندی‌ها"
            >
              <span className="relative">
                <IconHeart
                  className="h-5 w-5"
                  filled={wishlist.length > 0}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -end-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-0.5 text-[9px] font-extrabold text-pine">
                    {faNumber(wishlist.length)}
                  </span>
                )}
              </span>
              علاقه‌مندی‌ها
              <NavIndicator active={wishOpen} />
            </button>
            <AnimatePresence>
              {wishOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setWishOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-full end-0 z-20 mb-3 w-[calc(100vw-3rem)] max-w-xs"
                  >
                    <WishPanel onClose={() => setWishOpen(false)} />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCartOpen(true)}
            data-cart-anchor
            className={item(false)}
            aria-label="سبد خرید"
          >
            <span className="relative">
              <IconCart className="h-5 w-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    className="absolute -end-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-neon px-0.5 text-[9px] font-extrabold text-pine shadow-[0_0_10px_rgba(163,245,90,.7)]"
                  >
                    {faNumber(count)}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            سبد خرید
            <NavIndicator active={false} />
          </motion.button>
        </motion.div>
      </nav>

      {/* bottom spacing handled by footer padding */}
    </>
  );
}

function NavIndicator({ active }: { active: boolean }) {
  return (
    <span className="mt-0.5 grid h-1 w-1 place-items-center" aria-hidden>
      {active && (
        <motion.span
          layoutId="mobile-nav-dot"
          className="h-1 w-1 rounded-full bg-neon shadow-[0_0_8px_rgba(163,245,90,.9)]"
        />
      )}
    </span>
  );
}
