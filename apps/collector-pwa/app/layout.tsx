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
        <html lang="en">
            <body className="bg-neutral-950 antialiased min-h-screen flex flex-col">
                <PwaNavbar />
                <div className="flex-1">{children}</div>
            </body>
        </html>
    );
}