import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "야추 발사기",
  description: "클릭 시 재미있어집니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
