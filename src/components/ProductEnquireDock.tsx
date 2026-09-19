"use client";

import { useEffect, useState } from "react";

export function ProductEnquireDock() {
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const target = document.getElementById("enquire");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (formInView) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brown-light bg-cream p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <a
        href="#enquire"
        className="flex w-full items-center justify-center rounded-lg bg-gold py-3.5 text-sm font-semibold text-brown-dark"
      >
        Enquire Now
      </a>
    </div>
  );
}
