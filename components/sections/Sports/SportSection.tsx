// components/sections/SportsSection.tsx
'use client';
import React, { useRef, useState } from 'react';
import styles from './Sports.module.css';
import Image from 'next/image';
import Link from 'next/link';

// Ensure DOM types are available
declare var HTMLDivElement: {
  prototype: HTMLDivElement;
  new(): HTMLDivElement;
};

const sports = [
  {
    key: 'soccer',
    icon: '/assets/sports/svg/ball.svg',
    title: 'Soccer',
    centers: 3,
  },
  {
    key: 'swimming',
    icon: '/assets/sports/svg/swimming.svg',
    title: 'Swimming',
    centers: 5,
  },
  {
    key: 'cycling',
    icon: '/assets/sports/svg/bike.svg',
    title: 'Cycling',
    centers: 2,
  },
  {
    key: 'kayak',
    icon: '/assets/sports/svg/kayaking.svg',
    title: 'Kayak',
    centers: 1,
  },
  {
    key: 'tabletennis',
    icon: '/assets/sports/svg/tennis.svg',
    title: 'Table Tennis',
    centers: 4,
  },
  {
    key: 'volleyball',
    icon: '/assets/sports/svg/ball.svg',
    title: 'Volleyball',
    centers: 6,
  },
  {
    key: 'basketball',
    icon: '/assets/sports/svg/ball.svg',
    title: 'Basketball',
    centers: 5,
  },
  {
    key: 'tennis',
    icon: '/assets/sports/svg/tennis.svg',
    title: 'Tennis',
    centers: 2,
  },
  {
    key: 'handball',
    icon: '/assets/sports/svg/volley.svg',
    title: 'Handball',
    centers: 2,
  },
  {
    key: 'rugby',
    icon: '/assets/sports/svg/ball.svg',
    title: 'Rugby',
    centers: 3,
  },
  {
    key: 'baseball',
    icon: '/assets/sports/svg/ball.svg',
    title: 'Baseball',
    centers: 2,
  },
];

export default function SportsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag & Touch Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft ?? 0));
    setScrollLeft(carouselRef.current?.scrollLeft ?? 0);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft ?? 0));
    setScrollLeft(carouselRef.current?.scrollLeft ?? 0);
  };
  const handleTouchEnd = () => setIsDragging(false);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className={styles.sportsSection}>
      <div className={styles.headerRow}>
        <span className={styles.headerTitle}>SPORTS</span>
        <span className={styles.headerDescription}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam.
        </span>
      </div>
      <div
        className={`${styles.carousel} ${isDragging ? styles.active : ''}`}
        id='sports-carousel'
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {sports.map((sport, i) => (
          <div className={styles.sportCard} key={i}>
            <div className={styles.iconBox}>
              <Image
                src={sport.icon}
                alt={sport.title}
                width={132}
                height={132}
              />
            </div>
            <span className={styles.sportTitle}>{sport.title}</span>
            <Link
              href={`/centers/${sport.title.toLowerCase().replace(/\s/g, '-')}`}
              className={styles.centersLabel}
            >
              {sport.centers} sports centers available
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
