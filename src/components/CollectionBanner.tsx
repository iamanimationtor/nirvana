"use client";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Magnetic from "./Magnetic";
import { IconArrowLeft, IconInstagram } from "./Icons";

export default function CollectionBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      id="collection"
      ref={ref}
      className="relative my-10 h-[92svh] min-h-[560px] w-full overflow-hidden md:my-16"
    >
      {/* parallax bg */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-[-12%] will-change-transform"
      >
        <Image
          src="/images/collection.jpg"
          alt="کالکشن نیروانا"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-l from-pine/90 via-pine/60 to-pine/40"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.5),transparent_55%)]"
      />

      {/* light rays */}
      <div
        aria-hidden
        className="animate-ray absolute -top-10 start-[16%] h-[130%] w-36 rotate-[18deg] bg-gradient-to-b from-goldsoft/30 via-goldsoft/10 to-transparent blur-xl"
      />
      <div
        aria-hidden
        className="animate-ray absolute -top-10 start-[42%] h-[130%] w-24 rotate-[14deg] bg-gradient-to-b from-neon/20 via-neon/5 to-transparent blur-lg"
        style={{ animationDelay: "2.5s" }}
      />

      {/* floating leaf motif */}
      <motion.svg
        aria-hidden
        animate={{ y: [0, -16, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        viewBox="0 0 200 200"
        className="absolute bottom-[-30px] end-[6%] h-56 w-56 text-neon/15"
        fill="currentColor"
      >
        <path d="M100 195C42 160 20 110 38 55 88 28 148 38 172 88c18 44-14 92-72 107Z" />
      </motion.svg>

      {/* content */}
      <motion.div
        style={{ y: contentY }}
        className="container-x relative z-10 flex h-full items-center"
      >
        <div className="max-w-2xl text-ivory">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-latin inline-block rounded-full border border-ivory/25 px-4 py-2 text-[10px] backdrop-blur-sm"
          >
            THE COLLECTION
          </motion.span>

          <h2 className="mt-6 text-4xl font-extrabold leading-[1.2] md:text-6xl">
            <span className="block overflow-hidden pb-1">
              <motion.span
                initial={{ y: "105%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                هر قطعه،
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span
                initial={{ y: "105%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.85, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                یک <span className="text-goldsoft">داستان</span> دارد.
              </motion.span>
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-md text-sm leading-8 text-ivory/75 md:text-base"
          >
            محصولاتی متفاوت برای آدم‌هایی که چیزهای معمولی نمی‌خواهند.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <Link
                href="/shop"
                className="btn btn-gold group px-8 py-4 text-sm"
              >
                مشاهده کالکشن
                <IconArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </Magnetic>
            <a
              href="https://instagram.com/nirvana.3dprint"
              target="_blank"
              rel="noreferrer"
              className="glass flex items-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-ivory transition-colors hover:text-neon"
            >
              <IconInstagram className="h-4 w-4" />
              در اینستاگرام ببین
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

import { useRef } from "react";
