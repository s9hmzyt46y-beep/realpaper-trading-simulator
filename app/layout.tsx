import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { Toaster } from "sonner";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RealPaper Trading Simulator",
  description: "Simulate stock trading with real-time prices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SessionProvider>
          <I18nProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
            <Toaster position="top-right" />
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

