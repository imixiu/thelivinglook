'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Kitchen', href: '/kitchen-hacks' },
  { label: 'Organization', href: '/closet-organization' },
  { label: 'Cleaning', href: '/eco-cleaning' },
  { label: 'Plant Care', href: '/plant-care' },
  { label: 'Tech', href: '/tech-efficiency' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      borderBottom: '1px solid #eee',
      padding: '1rem 5%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      background: 'white',
      zIndex: 1000,
      flexWrap: 'wrap',
      gap: '10px',
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00a8a8', textDecoration: 'none' }}>
        TheLivingLook<span style={{ color: '#ff6a00' }}>.</span>
      </Link>

      {/* Desktop nav */}
      <nav className="header-nav-desktop" style={{ display: 'flex', gap: '20px' }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none', color: '#666', fontWeight: 500 }}>{label}</Link>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="header-hamburger"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'none' }}
      >
        <span style={{ display: 'block', width: 24, height: 2, background: '#333', margin: '5px 0' }} />
        <span style={{ display: 'block', width: 24, height: 2, background: '#333', margin: '5px 0' }} />
        <span style={{ display: 'block', width: 24, height: 2, background: '#333', margin: '5px 0' }} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <nav className="header-nav-mobile" style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          borderTop: '1px solid #eee',
          paddingTop: '8px',
        }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              textDecoration: 'none', color: '#333', fontWeight: 500,
              padding: '10px 0', borderBottom: '1px solid #f0f0f0',
            }}>{label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
