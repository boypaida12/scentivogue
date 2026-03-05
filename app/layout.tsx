import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { CartProvider } from "@/lib/cart-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Sour Gummy for headings
const playFairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// Varela Round for body text
const sourceSans3 = Source_Sans_3({
  weight: "400", // Varela Round only has one weight
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scenti Vogue",
  description: "Your trusted perfume plug. Premium quality, easy ordering online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playFairDisplay.variable} ${sourceSans3.variable} antialiased`}
      >
        <TooltipProvider>
          <AuthSessionProvider>
            <CartProvider>{children}</CartProvider>
          </AuthSessionProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
