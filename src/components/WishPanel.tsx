"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IconClose, IconHeart } from "./Icons";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/store/store";

export default function WishPanel({ onClose }: { onClose?: () => void }) {
  const { wishlist, toggleWish } = useStore();

  return (
    <div className="glass overflow-hidden rounded-[26px] p-4 text-ink shadow-deep">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold">
          علاقه‌مندی‌ها
          <span className="ms-2 font-latin text-[10px] text-inksoft">
            WISHLIST
          </span>
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="بستن"
            className="grid h-8 w-8 place-items-center rounded-full border border-linec text-inksoft transition hover:text-ink"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="glass grid h-14 w-14 place-items-center rounded-full text-gold">
            <IconHeart className="h-6 w-6" />
          </span>
          <p className="text-sm font-bold text-inksoft">
            هنوز چیزی پس‌نموده‌ای نیست.
          </p>
          <p className="text-xs text-inksoft/80">
            روی قلب هر محصول بزن تا اینجا ذخیره شود.
          </p>
        </div>
      ) : (
        <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pe-1">
          <AnimatePresence initial={false}>
            {wishlist.map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="group flex items-center gap-3 rounded-2xl border border-linec bg-paper/60 p-2"
                >
                  <Link href={`/product/${w.slug}`} onClick={onClose}>
                    <span className="block h-14 w-14 overflow-hidden rounded-xl">
                      <Image
                        src={w.image}
                        alt={w.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </span>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${w.slug}`}
                      onClick={onClose}
                      className="block truncate text-[13px] font-bold hover:underline"
                    >
                      {w.name}
                    </Link>
                    <span className="text-xs text-inksoft">
                      {formatPrice(w.price)}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      toggleWish({ id: w.id, images: [w.image] } as never)
                    }
                    aria-label="حذف"
                    className="grid h-8 w-8 place-items-center rounded-full text-inksoft transition hover:bg-ink/5 hover:text-ink"
                  >
                    <IconClose className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
