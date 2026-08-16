import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goalbound-career.realkfiros.chatgpt.site"),
  title: "Goalbound — Your Football Career",
  description: "Start at 16, join real clubs, survive the decisions nobody trains you for and build a football legacy of your own.",
  openGraph: {
    title: "Goalbound — Your Football Career",
    description: "Your talent. Your choices. Your legacy.",
    type: "website",
    images: [{ url: "/og.png", width: 1744, height: 909, alt: "Goalbound football career simulator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goalbound — Your Football Career",
    description: "Your talent. Your choices. Your legacy.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
