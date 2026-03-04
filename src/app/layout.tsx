import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Huddly — Walk up. Talk naturally.",
  description:
    "The friendliest interactive 3D virtual world for classrooms, offices, and communities. Walk up to anyone — video and audio start instantly.",
  keywords: [
    "harshalsp",
    "harshal patel dev",
    "interactive 3D world",
    "virtual office software",
    "spatial chat",
    "gather.town alternative",
    "remote work",
    "virtual classroom",
    "proximity chat",
    "metaverse",
  ],
  authors: [{ name: "Harshal Patel Dev", url: "https://harshalsp.vercel.app" }],
  creator: "harshalsp",
  openGraph: {
    title: "Huddly — Walk up. Talk naturally.",
    description:
      "Stunning 3D virtual world where your team can meet and collaborate by walking up to each other.",
    type: "website",
    locale: "en_US",
    url: "https://huddly.app",
    siteName: "Huddly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Huddly — Walk up. Talk naturally.",
    description:
      "The friendliest 3D virtual world. No awkward meeting links ever.",
  },
  verification: {
    google: "vPdZ1rzMuka8gCZFKRMek5HX04b9Eu4VWJv7tSzcyQg",
  },
  robots: "index, follow",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Huddly",
  url: "https://huddly.app",
  author: {
    "@type": "Person",
    name: "Harshal Patel Dev",
    url: "https://harshalsp.vercel.app"
  },
  description: "The friendliest interactive 3D virtual world for classrooms, offices, and communities."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${inter.variable} antialiased bg-[#030014] text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
