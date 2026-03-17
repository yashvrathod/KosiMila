// src/app/layout.tsx
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({ 
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Kosimila - Premium Makhana | Healthy Snacking Redefined",
  description: "Experience the finest roasted makhana. Premium quality, clean ingredients, delivered fresh to your doorstep.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-inter antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
