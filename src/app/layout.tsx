import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InternLink Cameroon - Internship & Apprenticeship Portal",
  description:
    "Connect with internship and apprenticeship opportunities in Cameroon. Find placements, submit reports, earn certificates, and bridge the gap between education and employment.",
  keywords: [
    "InternLink",
    "internship",
    "apprenticeship",
    "Cameroon",
    "student",
    "employment",
    "career",
    "stage",
    "apprentissage",
    "Cameroun",
  ],
  authors: [{ name: "InternLink Cameroon" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "InternLink Cameroon - Internship & Apprenticeship Portal",
    description:
      "Bridge the gap between education and employment in Cameroon",
    siteName: "InternLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InternLink Cameroon",
    description:
      "Bridge the gap between education and employment in Cameroon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
