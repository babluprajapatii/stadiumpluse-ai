"use client";

/**
 * SmoothScrollNav — Minimal client island for the landing page nav.
 *
 * This is extracted from LandingPage so that the bulk of the landing
 * page content can be server-rendered (HTML returned immediately from
 * the edge), while only the interactive scroll handler runs on the client.
 *
 * Usage: drop inside the <nav> alongside static Link elements.
 */

interface SmoothScrollNavProps {
  items: readonly string[];
  className?: string;
}

export function SmoothScrollNav({ items, className }: SmoothScrollNavProps) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={className}>
      {items.map((label) => (
        <a
          key={label}
          href={`#${label.toLowerCase()}`}
          onClick={(e) => handleScroll(e, label.toLowerCase())}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {label}
        </a>
      ))}
    </div>
  );
}
