import { NavLink } from 'react-router';
import styles from './Header.module.css';

function Header({ title }) {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      <nav className={styles.links}>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.current : styles.inactive
          }
          to={'/'}
        >
          Home
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.current : styles.inactive
          }
          to={'/about'}
        >
          About
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;
