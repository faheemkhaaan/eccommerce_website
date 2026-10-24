import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/Motion";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import AuthProvider from "@/components/auth/AuthProvider";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Organic Ghee — Bilona Ghee, Delivered Across Pakistan",
  description:
    "Hand-churned bilona ghee from a single grass-fed herd near Lahore. One ingredient, no additives, cash on delivery anywhere in Pakistan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <MotionProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}