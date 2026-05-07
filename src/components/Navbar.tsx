import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import "../App.css";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Get Involved", href: "#get-involved" },
  { name: "News", href: "#news" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape; trap focus inside menu while open
  useEffect(() => {
    if (!open) return;

    // Move focus into the first menu link when menu opens
    const firstLink = menuRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus(); // return focus to hamburger button
        return;
      }

      if (e.key !== "Tab") return;

      // Collect all focusable elements: toggle button + menu links
      const focusable = [
        toggleRef.current,
        ...(menuRef.current
          ? Array.from(menuRef.current.querySelectorAll<HTMLElement>("a"))
          : []),
      ].filter(Boolean) as HTMLElement[];

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: wrap from first → last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: wrap from last → first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close menu when user clicks outside the navbar
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const nav = toggleRef.current?.closest("nav");
      if (nav && !nav.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <a href="#home" className="navbar__logo">
          <span className="navbar__brand">WYMCA Esports</span>
        </a>

        {/* Desktop nav links (hidden on mobile via CSS) */}
        <div className="navbar__links">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="navbar__link">
              {link.name}
            </a>
          ))}
        </div>

        {/* Right-side controls: theme toggle + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <button
            className="navbar__theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            ref={toggleRef}
            className="navbar__toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="navbar-mobile-menu"
          >
            {/* Show ✕ when open, ☰ when closed */}
            <span className="navbar__toggle-icon" aria-hidden="true">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu — focus-trapped while open */}
      {open && (
        <div
          ref={menuRef}
          id="navbar-mobile-menu"
          className="navbar__mobile-menu"
          role="menu"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="navbar__mobile-link"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
