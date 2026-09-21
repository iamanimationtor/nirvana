"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconInstagram } from "./Icons";
import { Reveal } from "./Reveal";
import { INSTAGRAM_POSTS } from "@/lib/seed-data";

export default function InstagramSection() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallax = useTransform(scrollYProgress, [0, 1], [24, -24]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft")
        setLightbox((i) =>
          i === null ? null : (i + 1) % INSTAGRAM_POSTS.length
        );
      if (e.key === "ArrowRight")
        setLightbox((i) =>
          i === null ? null : (i - 1 + INSTAGRAM_POSTS.length) % INSTAGRAM_POSTS.length
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <section ref={ref} className="py-24">
      <div className="container-x">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <span className="font-latin text-[10px] font-medium text-gold">
              INSTAGRAM
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              نیروانا در اینستاگرام
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="https://instagram.com/nirvana.3dprint"
              target="_blank"
              rel="noreferrer"
              className="glass glass-hover group flex items-center gap-3 rounded-full py-2.5 pe-6 ps-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110">
                <IconInstagram className="h-4.5 w-4.5" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-latin text-xs font-bold text-ink" dir="ltr">
                  @nirvana.3dprint
                </span>
                <span className="mt-1 text-[11px] font-bold text-inksoft">
                  لایو از پشت صحنه چاپ‌ها
                </span>
              </span>
            </a>
          </Reveal>
        </div>

        {/* asymmetric masonry */}
        <motion.div
          style={{ y: parallax }}
          className="columns-2 gap-4 md:columns-3 [column-fill:balance] md:gap-5"
        >
          {INSTAGRAM_POSTS.map((post, i) => (
            <motion.button
              key={post.src + i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setLightbox(i)}
              data-cursor="کشف کن"
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[22px] border border-linec md:mb-5"
            >
              <div className={`relative w-full ${post.ratio}`}>
                <Image
                  src={post.src}
                  alt={post.caption}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                {/* glass hover overlay */}
                <span className="absolute inset-0 bg-pine/0 transition-colors duration-500 group-hover:bg-pine/50" />
                <span className="glass absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-50 place-items-center rounded-full text-ivory opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                  <IconInstagram className="h-6 w-6" />
                </span>
                <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-2xl bg-pine/70 px-3.5 py-2.5 text-start text-xs font-bold leading-6 text-ivory opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {post.caption}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[210] flex flex-col items-center justify-center bg-pine/95 p-4 backdrop-blur-2xl"
            onClick={() => setLightbox(null)}
          >
            <div
              className="relative w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightbox}
                  initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[28px] border border-ivory/15 shadow-deep"
                >
                  <div className="relative aspect-[4/5] w-full sm:aspect-[16/10]">
                    <Image
                      src={INSTAGRAM_POSTS[lightbox].src}
                      alt={INSTAGRAM_POSTS[lightbox].caption}
                      fill
                      sizes="(max-width: 768px) 100vw, 75vw"
                      priority
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-ivory/85">
                  {INSTAGRAM_POSTS[lightbox].caption}
                </p>
                <span className="font-latin text-[10px] text-ivory/40" dir="ltr">
                  @{INSTAGRAM_POSTS.length - lightbox}/{INSTAGRAM_POSTS.length}
                </span>
              </div>
            </div>

            {/* controls */}
            <div className="mt-5 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(
                    (lightbox - 1 + INSTAGRAM_POSTS.length) %
                      INSTAGRAM_POSTS.length
                  );
                }}
                aria-label="قبلی"
                className="glass grid h-12 w-12 place-items-center rounded-full text-ivory"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m14 6-6 6 6 6" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox + 1) % INSTAGRAM_POSTS.length);
                }}
                aria-label="بعدی"
                className="glass grid h-12 w-12 place-items-center rounded-full text-ivory"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10 6 6 6-6 6" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setLightbox(null)}
                aria-label="بستن"
                className="glass ms-auto grid h-12 w-12 place-items-center rounded-full text-ivory"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
