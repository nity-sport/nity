// components/sections/Hero.tsx
import styles from "./Hero.module.css";
import Image from "next/image";

export default function Hero() {
    return (
        <section className={styles.hero}>
            <video
                className={styles.videoBackground}
                src="/videos/nityHero.mp4"
                autoPlay
                loop
                muted
                playsInline
            ></video>

            <div className={styles.content}>
                <h1 className={styles.title}>YOUR SPORTRAVEL</h1>
                <button className={styles.videoBtn}>
                    <Image
                        src="/assets/watchthevideo.png"
                        alt="Watch"
                        width={28}
                        height={28}
                    />
                    <span className={styles.videoLabel}>WATCH THE VIDEO</span>
                </button>
                <form className={styles.form}>
                    <select><option>Sport</option></select>
                    <select><option>Date</option></select>
                    <select><option>Age</option></select>
                    <select><option>Category</option></select>
                    <button type="submit" className={styles.submitBtn}>
                        <Image src="/assets/icons/arrow-right.svg" alt="Go" width={16} height={16} />
                    </button>
                </form>
            </div>
        </section>
    );
}
