"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import Navbar from "./Navbar";
import { AuthProvider } from "./AuthProvider";
import { StoreProvider } from "@/store/store";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });
const SearchOverlay = dynamic(() => import("./SearchOverlay"), { ssr: false });
const QuickViewModal = dynamic(() => import("./QuickViewModal"), { ssr: false });

export function Shell({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AuthProvider>
      <div className="relative min-h-screen bg-canvas font-sans text-ink">
        <div className="noise" aria-hidden />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <SearchOverlay />
        <QuickViewModal />
      </div>
      </AuthProvider>
    </StoreProvider>
  );
}
