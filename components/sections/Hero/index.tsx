// components/sections/Hero.tsx
import styles from "./Hero.module.css";
import Image from "next/image";
import HeroSearchBar from "./HeroSearchBar";

export default function Hero() {
    return (
        <>
        <section className={styles.hero}>
            <video
                className={styles.videoBackground}
                src="/videos/nityHero.mp4"
                autoPlay
                loop
                muted
                playsInline
            ></video>
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                <h1 className={styles.title}>YOUR SPORTRAVEL</h1>
                {/* outros elementos opcionais */}
            </div>
        </section>
        <HeroSearchBar />
        </>
    );
}
