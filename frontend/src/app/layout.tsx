import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider.js";
import { SocketProvider } from "@/providers/socket-provider.js";
import { Toaster } from "@/components/ui/sonner.js";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sneaker Drop | Real-Time Inventory",
  description: "Limited edition sneaker drops with real-time stock updates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-right" />
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
