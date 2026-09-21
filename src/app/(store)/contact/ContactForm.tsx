"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { IconSend } from "@/components/Icons";
import { useStore } from "@/store/store";

export default function ContactForm() {
  const { notify } = useStore();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), contact: contact.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        notify("پیام شما ثبت شد؛ به‌زودی جواب می‌دهیم ✓");
        setName("");
        setContact("");
        setBody("");
      } else {
        notify("خطایی رخ داد؛ دوباره تلاش کنید");
      }
    } catch {
      notify("خطا در اتصال؛ دوباره تلاش کنید");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex h-full flex-col gap-4 rounded-[28px] border border-linec bg-paper/70 p-6 md:p-8"
    >
      <h2 className="text-lg font-extrabold">ارسال پیام</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-extrabold text-inksoft">
            نام شما
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="مثلاً: سارا"
            className="field"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-extrabold text-inksoft">
            ایمیل یا شماره (اختیاری)
          </label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="برای پاسخ به تو"
            className="field"
          />
        </div>
      </div>
      <div className="flex-1">
        <label className="mb-2 block text-xs font-extrabold text-inksoft">
          پیام
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={6}
          placeholder="دربارهٔ چه چیزی می‌خواهی صحبت کنیم؟"
          className="field resize-none !rounded-3xl"
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.96 }}
        type="submit"
        disabled={sending}
        className="btn btn-primary w-full py-4 text-sm disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {sending ? "در حال ارسال…" : "ارسال پیام"}
        <IconSend className="h-4 w-4" />
      </motion.button>
    </form>
  );
}
