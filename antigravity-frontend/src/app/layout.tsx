import type { Metadata } from "next";
import { Inter, Ephesis } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });
const logoFont = Ephesis({ weight: '400', subsets: ['latin'], variable: '--font-logo' });

export const metadata: Metadata = {
  title: "Antigravity | Defy The Norm",
  description: "A premium streetwear and modern fashion brand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${logoFont.variable} bg-black text-white min-h-screen flex flex-col selection:bg-purple-500 selection:text-white`}
      >
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black"></div>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
