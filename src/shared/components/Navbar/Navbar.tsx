import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiFileText } from 'react-icons/fi';
import { classNames } from '@shared/helpers/classNames';
import styles from './Navbar.module.scss';

const NAV_ITEMS = [
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

        <nav className={classNames(styles.nav, isOpen && styles.navOpen)}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(styles.navLink, isActive && styles.navLinkActive)
              }
              onClick={() => setIsOpen(false)}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
