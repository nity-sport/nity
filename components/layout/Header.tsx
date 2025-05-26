// components/layout/Header.tsx
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    console.log('🔐 Authentication Status:', {
      isAuthenticated,
      user: user ? { name: user.name, email: user.email } : null,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [isAuthenticated, user]);

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <Image src="/assets/nity-logo.png" alt="Nity" width={105} height={25} />
      </Link>

      <nav className={styles.nav}>
        <Link href="/sport-centers" className={styles.navLink}>Sportravel</Link>
        <Link href="/tours" className={styles.navLink}>Experiences</Link>
      </nav>

      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Language switch">
          <Image src="/assets/translate.png" alt="Language" width={24} height={24} />
        </button>
        {!isAuthenticated && (
          <Link href="/Auth/signin" className={styles.iconButton} aria-label="Login">
            <Image src="/assets/account_circle.png" alt="Login" width={24} height={24} />
          </Link>
        )}
        {isAuthenticated ? (
          <div className={styles.userMenu}>
            <button 
              className={styles.userButton}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className={styles.avatar}>
                {user?.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name} 
                    width={32} 
                    height={32} 
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className={styles.userName}>{user?.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                className={styles.chevronIcon}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
            </button>
            {userMenuOpen && (
              <div className={styles.userDropdown}>
                <Link href="/profile" className={styles.dropdownItem}>
                  Profile
                </Link>
                <Link href="/settings" className={styles.dropdownItem}>
                  Settings
                </Link>
                <button 
                  onClick={logout} 
                  className={styles.dropdownItem}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/Auth/signup" className={styles.signup}>
            Sign up
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              className={styles.signupIcon}
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        )}
      </div>

      <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width={24}
          height={24}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
          />
        </svg>
      </button>

      {menuOpen && (
        <div className={styles.dropdown}>
          <Link href="/sport-centers" className={styles.navLink}>Sportravel</Link>
          <Link href="/tours" className={styles.navLink}>Experiences</Link>
          <button className={styles.iconButton} aria-label="Language switch">
            <Image src="/assets/translate.png" alt="Language" width={24} height={24} />
          </button>
          {!isAuthenticated && (
            <Link href="/Auth/signin" className={styles.iconButton} aria-label="Login">
              <Image src="/assets/account_circle.png" alt="Login" width={24} height={24} />
            </Link>
          )}
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button 
                className={styles.userButton}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className={styles.avatar}>
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name} 
                      width={32} 
                      height={32} 
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className={styles.userName}>{user?.name}</span>
              </button>
              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <Link href="/profile" className={styles.dropdownItem}>
                    Profile
                  </Link>
                  <Link href="/settings" className={styles.dropdownItem}>
                    Settings
                  </Link>
                  <button 
                    onClick={logout} 
                    className={styles.dropdownItem}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/Auth/signup" className={styles.signup}>
              Sign up
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                className={styles.signupIcon}
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
