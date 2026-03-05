"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import CartBadge from "./cart-badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  { href: "/products", label: "Shop" },
  // { href: "/", label: "About" },
  // { href: "/", label: "Blog" },
];

export default function StoreNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCart();

  // Close menu when clicking on a link
  const closeMenu = () => setIsMenuOpen(false);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`border-b border-b-gray-300 bg-white sticky top-0 z-999 transition-shadow duration-200 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-family-heading font-semibold transition-colors"
          >
            Scentivogue
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-black font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <CartBadge />
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
              <span
                className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed top-18.25 right-0 left-0 bg-white z-51 transform transition-transform duration-300 ease-in-out md:hidden border-b shadow-lg ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-6 space-y-4">
          {/* Navigation Links */}
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="block text-lg text-gray-700 hover:text-gray-900 transition-colors text-center py-2"
            >
              {link.label}
            </Link>
          ))}

          {/* Cart Button */}
          <div className="flex justify-center pt-2" onClick={closeMenu}>
            <CartBadge />
          </div>
        </div>
      </div>
      <Link
        href="/cart"
        className="md:hidden fixed bottom-6 right-6 z-50 bg-black text-white rounded-none p-4 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="View cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </>
  );
}
