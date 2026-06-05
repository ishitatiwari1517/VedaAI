import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'AI-powered question paper generator for teachers. Create professional exam papers in minutes.',
  keywords: ['AI', 'assessment', 'question paper', 'teacher', 'CBSE', 'education'],
  authors: [{ name: 'VedaAI' }],
  openGraph: {
    title: 'VedaAI – AI Assessment Creator',
    description: 'Generate beautiful, structured exam papers with AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
