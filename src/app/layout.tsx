import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FeedbackLanguageProvider } from "@/features/feedback/components/feedback-i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Smart Feedback",
  title: {
    default: "Smart Feedback",
    template: "%s · Smart Feedback",
  },
  description:
    "Share your healthcare experience with Smart Feedback and help our clinics improve patient care.",
  appleWebApp: {
    capable: true,
    title: "Smart Feedback",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <FeedbackLanguageProvider>{children}</FeedbackLanguageProvider>
      </body>
    </html>
  );
}
