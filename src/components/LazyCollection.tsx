"use client";

import dynamic from "next/dynamic";

const CollectionBanner = dynamic(() => import("./CollectionBanner"), {
  ssr: false,
  loading: () => <div className="my-16 h-[560px]" />,
});

export default function LazyCollection() {
  return <CollectionBanner />;
}
