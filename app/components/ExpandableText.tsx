"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  text: string;
  clampLines?: number; // number of lines to show when collapsed
  className?: string; // additional classes for the wrapper
  textClassName?: string; // classes for the paragraph text
  seeMoreLabel?: string;
  seeLessLabel?: string;
  colorClass?: string; // shortcut for text color, default gray-700
  lengthThreshold?: number; // extra guard to show see more if text is long
};

export default function ExpandableText({
  text,
  clampLines = 4,
  className = "",
  textClassName = "",
  seeMoreLabel = "See more",
  seeLessLabel = "Show less",
  colorClass = "text-gray-700",
  lengthThreshold = 220,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const pRef = useRef<HTMLParagraphElement | null>(null);

  const content = useMemo(() => (text || "").trim(), [text]);

  useEffect(() => {
    const el = pRef.current;
    if (!el) {
      setCanExpand(content.length > lengthThreshold);
      return;
    }

    // Apply collapsed styles temporarily to measure overflow
    const prevDisplay = el.style.display;
    const prevOrient = (el.style as any).WebkitBoxOrient;
    const prevLineClamp = (el.style as any).WebkitLineClamp;
    const prevOverflow = el.style.overflow;

    if (!expanded) {
      el.style.display = "-webkit-box";
      (el.style as any).WebkitBoxOrient = "vertical";
      (el.style as any).WebkitLineClamp = String(clampLines);
      el.style.overflow = "hidden";
    }

    requestAnimationFrame(() => {
      try {
        const overflows = el.scrollHeight > el.clientHeight + 2;
        const longByLength = content.length > lengthThreshold;
        setCanExpand(overflows || longByLength);
      } finally {
        // restore
        el.style.display = prevDisplay;
        (el.style as any).WebkitBoxOrient = prevOrient as any;
        (el.style as any).WebkitLineClamp = prevLineClamp as any;
        el.style.overflow = prevOverflow;
      }
    });
  }, [content, expanded, clampLines, lengthThreshold]);

  const collapsedStyle = expanded
    ? undefined
    : ({
        display: "-webkit-box",
        WebkitBoxOrient: "vertical" as const,
        WebkitLineClamp: String(clampLines),
        overflow: "hidden",
      } as React.CSSProperties);

  return (
    <div className={`relative ${className}`}>
      <p ref={pRef} className={`${colorClass} leading-relaxed ${textClassName}`} style={collapsedStyle}>
        {content}
      </p>

      {canExpand && !expanded && (
        <span
          onClick={() => setExpanded(true)}
          className="text-blue-600 hover:underline text-sm"
        >
          {seeMoreLabel}
        </span>
      )}

      {canExpand && expanded && (
        <span
          onClick={() => setExpanded(false)}
          className="text-blue-600 hover:underline text-sm"
        >
          {seeLessLabel}
        </span>
      )}
    </div>
  );
}
