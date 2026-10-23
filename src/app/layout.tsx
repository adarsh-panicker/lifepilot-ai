import type { Metadata } from 'next';
import './globals.css';
import { ModeProvider } from '@/lib/mode-context';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'LifePilot AI — Alexa+ Inspired Personal Productivity Assistant',
  description:
    'An intelligent personal productivity assistant powered by Amazon Bedrock with an Alexa+ inspired conversational workflow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-950 text-slate-100 min-h-screen antialiased flex">
        <ModeProvider>
          {/* Sidebar */}
          <Navigation />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            <Header />
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </ModeProvider>
      </body>
    </html>
  );
}
