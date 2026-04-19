import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "데스크탑 펫",
  description: "귀여운 나만의 데스크탑 펫을 키워보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
