import './globals.css';

export const metadata = {
    title: 'Swivo Magic Advertorials',
    description: 'Latest news and stories from Swivo Magic',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
