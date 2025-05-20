// components/layout/Header.tsx
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <button className={styles.iconButton} aria-label="Login">
          <Image src="/assets/account_circle.png" alt="Login" width={24} height={24} />
        </button>
        <button className={styles.signup}>
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
        </button>
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
          <button className={styles.iconButton} aria-label="Login">
            <Image src="/assets/account_circle.png" alt="Login" width={24} height={24} />
          </button>
          <button className={styles.signup}>
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
          </button>
        </div>
      )}
    </header>
  );
}
