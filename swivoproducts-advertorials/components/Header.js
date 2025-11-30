import Link from 'next/link';

export default function Header() {
    return (
        <header className="site-header">
            <div className="container header-container">
                <div className="logo">
                    <Link href="/">Swivo Magazine</Link>
                </div>
                <nav className="main-nav">
                    <Link href="/">Home</Link>
                    <Link href="/category/lifestyle">Lifestyle</Link>
                    <Link href="/category/health-family">Health & Family</Link>
                </nav>
            </div>
        </header>
    );
}
