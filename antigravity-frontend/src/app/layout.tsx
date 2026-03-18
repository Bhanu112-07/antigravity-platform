import type { Metadata } from "next";
import { Inter, Ephesis, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });
const logoFont = Ephesis({ weight: '400', subsets: ['latin'], variable: '--font-logo' });
const brandFont = Cinzel({ subsets: ['latin'], variable: '--font-brand' });

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
        className={`${inter.className} ${logoFont.variable} ${brandFont.variable} bg-black text-white min-h-screen flex flex-col selection:bg-purple-500 selection:text-white`}
      >
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black"></div>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </body>
    </html>
  );
}
