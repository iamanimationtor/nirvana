"use client";

import dynamic from "next/dynamic";

const InstagramSection = dynamic(() => import("./InstagramSection"), {
  ssr: false,
  loading: () => <div className="container-x h-96" />,
});

export default function LazyInstagram() {
  return <InstagramSection />;
}
