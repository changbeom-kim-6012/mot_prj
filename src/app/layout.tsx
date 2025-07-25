import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideMenu from "@/components/SideMenu";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MOT Club",
  description: "Management of Technology 관련 지식 공유 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <SideMenu />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
