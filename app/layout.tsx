import type {Metadata} from 'next';
import { Space_Grotesk, Bebas_Neue, Roboto_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-ui',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400'],
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'T - REX Elite Hoops | The Future of Performance',
  description: 'Experience the next generation of basketball engineering.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bebasNeue.variable} ${robotoMono.variable}`}>
      <body suppressHydrationWarning className="selection:bg-[#FF5500] selection:text-white">
        {children}
      </body>
    </html>
  );
}
