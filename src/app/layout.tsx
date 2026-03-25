import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './booking.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AirCanada PTFS',
  description: 'The official website of the AirCanada PTFS community with over 7,000 active members',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
