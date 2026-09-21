"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconCart,
  IconClose,
  IconMinus,
  IconPlus,
  IconTrash,
  IconTruck,
} from "./Icons";
import { faNumber, formatPrice } from "@/lib/format";
import { useStore } from "@/store/store";

export default function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    items,
    setQty,
    remove,
    total,
    count,
  } = useStore();
  const router = useRouter();

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[170]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-pine/60 backdrop-blur-lg"
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: "-105%" }}
            animate={{ x: 0 }}
            exit={{ x: "-105%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="absolute inset-y-0 left-0 flex w-full max-w-[430px] flex-col border-e border-linec bg-paper shadow-2xl dark:bg-[#141b12]"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-linec px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="glass grid h-10 w-10 place-items-center rounded-full text-forest dark:text-neon">
                  <IconCart className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold">سبد خرید</h2>
                  <span className="text-xs text-inksoft">
                    {faNumber(count)} قلم کالا
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCartOpen(false)}
                aria-label="بستن سبد"
                className="glass glass-hover grid h-10 w-10 place-items-center rounded-full text-ink"
              >
                <IconClose className="h-5 w-5" />
              </motion.button>
            </div>

            {/* items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <motion.span
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="glass grid h-20 w-20 place-items-center rounded-full text-gold"
                  >
                    <IconCart className="h-8 w-8" />
                  </motion.span>
                  <div>
                    <p className="text-base font-extrabold">سبد خرید خالی است</p>
                    <p className="mt-1 text-sm text-inksoft">
                      بگذار چیزی زیبا درش بیاوریم
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      router.push("/shop");
                    }}
                    className="btn btn-primary px-6 py-3 text-sm"
                  >
                    مشاهده محصولات
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((it) => (
                      <motion.li
                        key={it.id}
                        layout
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.7,
                          filter: "blur(8px)",
                          height: 0,
                          marginBottom: -12,
                        }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3 overflow-hidden rounded-3xl border border-linec bg-canvas/60 p-3"
                      >
                        <motion.span
                          whileHover={{ rotate: -4, scale: 1.06 }}
                          className="block h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-soft"
                        >
                          <Image
                            src={it.image}
                            alt={it.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        </motion.span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold">
                            {it.name}
                          </p>
                          <p className="mt-0.5 text-xs text-inksoft">
                            {formatPrice(it.price)}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-linec bg-paper px-1.5 py-1">
                            <button
                              onClick={() => setQty(it.id, it.qty - 1)}
                              aria-label="کاهش"
                              className="grid h-6 w-6 place-items-center rounded-full text-inksoft transition hover:bg-ink/8 hover:text-ink"
                            >
                              <IconMinus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-5 text-center text-xs font-extrabold">
                              {faNumber(it.qty)}
                            </span>
                            <button
                              onClick={() => setQty(it.id, it.qty + 1)}
                              aria-label="افزایش"
                              className="grid h-6 w-6 place-items-center rounded-full text-inksoft transition hover:bg-ink/8 hover:text-ink"
                            >
                              <IconPlus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => remove(it.id)}
                            aria-label="حذف از سبد"
                            className="grid h-8 w-8 place-items-center rounded-full text-inksoft transition hover:bg-red-500/10 hover:text-red-500"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-extrabold text-forest dark:text-neon">
                            {formatPrice(it.price * it.qty)}
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* footer */}
            {items.length > 0 && (
              <div className="border-t border-linec px-5 py-4">
                <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl bg-olive/10 py-2.5 text-xs font-bold text-olivedeep dark:text-neon">
                  <IconTruck className="h-4 w-4" />
                  ارسال رایگان به سراسر کشور
                </div>
                <div className="flex items-center justify-between text-sm text-inksoft">
                  <span>جمع کالاها</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-extrabold">جمع کل</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.15, color: "#a3f55a" }}
                    animate={{ scale: 1, color: "inherit" }}
                    className="text-lg font-extrabold"
                  >
                    {formatPrice(total)}
                  </motion.span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="btn btn-primary mt-4 w-full py-4 text-sm"
                >
                  ادامه فرآیند خرید
                </button>
                <button
                  onClick={() => setCartOpen(false)}
                  className="mt-2 w-full py-2 text-center text-xs font-bold text-inksoft transition hover:text-ink"
                >
                  بازگشت به فروشگاه
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
