import type { Metadata } from 'next';
import './globals.css';
import './booking.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WebsiteAssistant from '@/components/WebsiteAssistant';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'AirCanada PTFS',
  description: 'The official website of the AirCanada PTFS community with over 7,000 active members',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WebsiteAssistant />
        <Analytics />
      </body>
    </html>
  );
}
