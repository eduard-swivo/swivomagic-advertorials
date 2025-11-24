import './globals.css';
import Header from '@/components/Header';
import UTMHandler from '@/components/UTMHandler';

export const metadata = {
    title: 'Swivo Magazine',
    description: 'Latest news and stories from Swivo Magic',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@400;700;900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <UTMHandler />
                <Header />
                {children}
            </body>
        </html>
    );
}
