import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KHIDI AI 채용 비서",
  description: "한국보건산업진흥원 취업 준비생을 위한 AI 브리핑 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="antialiased h-full bg-gray-50"
        style={{ fontFamily: 'system-ui, "Noto Sans KR", sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
