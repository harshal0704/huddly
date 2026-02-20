import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Huddly — Walk up. Talk naturally.",
  description:
    "The friendliest 2D virtual world for classrooms, offices, and communities. Walk up to anyone — video and audio start instantly. No awkward meeting links ever.",
  keywords: [
    "virtual office",
    "2D virtual world",
    "gather.town alternative",
    "remote work",
    "virtual classroom",
    "proximity chat",
    "spatial audio",
  ],
  openGraph: {
    title: "Huddly — Walk up. Talk naturally.",
    description:
      "Beautiful 2D virtual world where your team can meet and collaborate by walking up to each other.",
    type: "website",
    locale: "en_US",
    url: "https://huddly.app",
    siteName: "Huddly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Huddly — Walk up. Talk naturally.",
    description:
      "The friendliest 2D virtual world. No awkward meeting links ever.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[#030014] text-white`}>
        {children}
      </body>
    </html>
  );
}
