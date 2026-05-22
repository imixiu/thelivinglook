import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <span>TheLivingLook</span>
        </div>
        <nav className="footer-nav">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/#articles">Categories</Link></li>
            <li><Link href="#">About</Link></li>
            <li><Link href="#">Privacy Policy</Link></li>
          </ul>
        </nav>
        <p className="copyright">&copy; 2026 TheLivingLook. All rights reserved.</p>
      </div>
    </footer>
  );
}
