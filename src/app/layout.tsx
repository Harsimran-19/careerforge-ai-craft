import React from "react";
import { Providers } from "./providers";
import "../index.css";

export const metadata = {
  title: "CareerForge AI",
  description: "Your AI-powered career development platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
