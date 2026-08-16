import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { StyledComponentsRegistry } from "./StyledComponentsRegistry";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goalbound-career.realkfiros.chatgpt.site"),
  title: "Goalbound — Your Football Career",
  description: "Begin in an academy, a smaller senior side or as a rare gem, then build a football career across real clubs and consequential decisions.",
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
      <body className={geist.variable}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
