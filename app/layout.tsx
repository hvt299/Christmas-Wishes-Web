import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";
import SnowfallBackground from "@/components/SnowfallBackground";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Christmas Wishes",
  description: "Gửi những lời chúc Giáng Sinh ấm áp đến người thân yêu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="vi">
      <body className={`${inter.variable} ${dancingScript.variable}`}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <SnowfallBackground />
          {children}
          <MusicPlayer />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}