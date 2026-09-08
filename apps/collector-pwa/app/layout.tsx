import type { Metadata } from 'next';
import './globals.css';
import PwaNavbar from '../components/Navbar';

export const metadata: Metadata = {
    title: 'Kabadiwala Connect - Collector App',
    description: 'Voice-first Urban Mining DPI for Ground Collectors',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="hi" translate="no" className="notranslate">
            <head>
                <meta name="google" content="notranslate" />
            </head>
            <body className="bg-neutral-950 antialiased min-h-screen flex flex-col notranslate">
                <PwaNavbar />
                <div className="flex-1">{children}</div>
            </body>
        </html>
    );
}