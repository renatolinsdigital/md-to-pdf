import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiFileText } from 'react-icons/fi';
import styles from './Navbar.module.scss';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/converter', label: 'Converter' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <NavLink to="/" className={styles.logo} onClick={() => setIsOpen(false)}>
          <FiFileText className={styles.logoIcon} />
          <span>MD to PDF</span>
        </NavLink>

        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              onClick={() => setIsOpen(false)}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className={styles.menuButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
