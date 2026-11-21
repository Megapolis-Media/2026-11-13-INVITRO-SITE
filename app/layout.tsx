import type { Metadata } from "next";
import "./globals.css";
import {heroInputScript} from "@/lib/hero-input";

export const metadata: Metadata = {
  title: "Новогодний телецентр INVITRO",
  description: "23 декабря в 12:00 МСК. Новогодний эфир, радио, игры и лотерея для сотрудников INVITRO.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" id="telecenter">
      <head><link rel="stylesheet" href="/brand-type/fonts.css"/><link rel="stylesheet" href="/telecenter-ui.css?v=98"/><script dangerouslySetInnerHTML={{__html:heroInputScript}} /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
