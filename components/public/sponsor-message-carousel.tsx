"use client";

import { useEffect, useMemo, useState } from "react";

export interface SponsorMessageCarouselItem {
  id: string;
  sponsorName: string;
  message: string;
}

interface SponsorMessageCarouselProps {
  messages: SponsorMessageCarouselItem[];
}

const VISIBLE_MESSAGE_COUNT = 4;
const ROTATION_INTERVAL_MS = 12000;

function getVisibleMessages(
  messages: SponsorMessageCarouselItem[],
  startIndex: number,
): SponsorMessageCarouselItem[] {
  if (messages.length <= VISIBLE_MESSAGE_COUNT) {
    return messages;
  }

  return Array.from({ length: VISIBLE_MESSAGE_COUNT }, (_, offset) => {
    return messages[(startIndex + offset) % messages.length];
  });
}

export function SponsorMessageCarousel({
  messages,
}: SponsorMessageCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= VISIBLE_MESSAGE_COUNT) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const intervalId = window.setInterval(() => {
      setStartIndex((current) => (current + VISIBLE_MESSAGE_COUNT) % messages.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [messages.length]);

  const visibleMessages = useMemo(
    () => getVisibleMessages(messages, startIndex),
    [messages, startIndex],
  );

  if (messages.length === 0) {
    return (
      <p className="rounded-lg border border-[#d8d3c8] bg-[#f7f3ea] px-5 py-4 text-sm text-[#63706a]">
        현재 공개된 응원 메시지가 없습니다.
      </p>
    );
  }

  return (
    <div
      key={startIndex}
      aria-live="polite"
      className="mx-auto grid w-full max-w-6xl gap-4 motion-safe:animate-[sponsor-message-slide_4000ms_cubic-bezier(0.22,1,0.36,1)] sm:grid-cols-2 lg:grid-cols-4"
    >
      {visibleMessages.map((item, index) => (
        <blockquote
          key={`${startIndex}-${item.id}`}
          className={[
            "relative min-h-40 overflow-hidden rounded-lg border border-[#d8d3c8]/70 bg-[#fffdf8]/92 p-5 text-left shadow-[0_20px_48px_rgba(0,0,0,0.18)] backdrop-blur-md",
            index > 2 ? "hidden lg:block" : "",
          ].join(" ")}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[#d7a33f]" />
          <p className="relative text-sm font-semibold leading-7 text-[#314039] text-pretty">
            {item.message}
          </p>
          <footer className="relative mt-4 text-xs font-black text-[#486f5b]">
            {item.sponsorName} 후원자님
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
