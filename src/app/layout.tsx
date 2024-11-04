import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/providers/SessionProvider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PodBite",
  description: "YouTube Summary Generator",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors duration={8000} />
      </body>
    </html>
  );
}