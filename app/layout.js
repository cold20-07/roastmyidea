import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700', '900'] });

export const metadata = {
  title: 'RoastMyIdea - Get Your Startup Idea Brutally Roasted',
  description: 'AI will roast your idea, then give you 10 real problems you\'ll face (and how to solve them). Get honest feedback on your startup ideas.',
  openGraph: {
    title: 'RoastMyIdea - Get Your Startup Idea Brutally Roasted',
    description: 'Think your idea is good? Let\'s find out. Get roasted by AI and receive 10 real problems with solutions.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}