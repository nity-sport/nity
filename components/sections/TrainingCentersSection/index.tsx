// src/components/sections/TrainingCentersSection/index.tsx
"use client";
import React, { useRef, useState, useEffect } from 'react';
import styles from './TrainingCenterSection.module.css';
import TrainingCenterCard from './TrainingCenterCard';
import { SportCenterType } from '../../../src/types/sportcenter';


export default function TrainingCentersSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [centers, setCenters] = useState<(SportCenterType & { _id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sportcenter?public=true');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.sportCenters && Array.isArray(data.sportCenters)) {
          setCenters(data.sportCenters as (SportCenterType & { _id: string })[]);
        } else if (Array.isArray(data)) {
          setCenters(data as (SportCenterType & { _id: string })[]);
        } else {
          console.warn("Formato de dados inesperado da API:", data);
          setCenters([]);
        }
      } catch (e: any) {
        console.error("[TrainingCentersSection] Falha ao buscar centros de treinamento:", e);
        setError(e.message || "Erro ao carregar dados.");
        setCenters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  useEffect(() => {
    const calculateItems = () => {
      if (window.innerWidth <= 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth <= 1200) {
        setItemsPerPage(2); // Permite 2 cards visíveis em telas médias/grandes
      } else {
        setItemsPerPage(2); // Padrão para telas maiores
      }
    };
    calculateItems();
    window.addEventListener('resize', calculateItems);
    return () => window.removeEventListener('resize', calculateItems);
  }, []);

  useEffect(() => {
    if (centers.length > 0) {
      setTotalPages(Math.ceil(centers.length / itemsPerPage));
    } else {
      setTotalPages(1);
    }
    setCurrentPage(1);
    if (carouselRef.current) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [itemsPerPage, centers]);


  const handleNavigation = (direction: 'next' | 'prev') => {
    if (!carouselRef.current || centers.length === 0) return;

    let newPageTarget = direction === 'next' ? currentPage + 1 : currentPage - 1;
    
    const cardWidth = carouselRef.current.children[0]?.clientWidth || 0; // Largura do primeiro card
    const gap = 22; // Gap entre os cards, conforme CSS
    const itemTotalWidth = cardWidth + gap;

    const scrollAmount = (newPageTarget -1) * itemTotalWidth * itemsPerPage;
    const firstItemIndexOfNewPage = (newPageTarget - 1) * itemsPerPage;
    if (firstItemIndexOfNewPage < centers.length && firstItemIndexOfNewPage >=0) {
        const targetScrollLeft = firstItemIndexOfNewPage * itemTotalWidth;
        carouselRef.current.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        setCurrentPage(newPageTarget);
    } else if (direction === 'next' && currentPage < totalPages) { // Caso de arredondamento ou último item
        carouselRef.current.scrollTo({ left: carouselRef.current.scrollWidth - carouselRef.current.clientWidth, behavior: 'smooth' });
        setCurrentPage(totalPages);
    } else if (direction === 'prev' && currentPage > 1) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        setCurrentPage(1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = 'grabbing';
  };
  const handleMouseLeave = () => {
    if (!carouselRef.current) return;
    setIsDragging(false);
    carouselRef.current.style.cursor = 'grab';
  };
  const handleMouseUp = () => {
    if (!carouselRef.current) return;
    setIsDragging(false);
    carouselRef.current.style.cursor = 'grab';
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <section className={styles.trainingCentersSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sport Centers</h2>
        </div>
        <p>Carregando centros...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.trainingCentersSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sport Centers</h2>
        </div>
        <p>Erro ao carregar: {error}</p>
      </section>
    );
  }
  
  if (centers.length === 0) {
    return (
      <section className={styles.trainingCentersSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sport Centers</h2>
        </div>
        <p>Nenhum centro de treinamento encontrado.</p>
      </section>
    );
  }

  return (
    <section className={styles.trainingCentersSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sport Centers</h2>
        {centers.length > itemsPerPage && ( // Só mostra navegação se houver mais itens que o visível
            <div className={styles.navigation}>
            <button
                onClick={() => handleNavigation('prev')}
                disabled={currentPage === 1}
                className={styles.navButton}
                aria-label="Anterior"
            >
                &lt;
            </button>
            <span className={styles.pagination}>
                {String(currentPage).padStart(2, '0')}/{String(totalPages).padStart(2, '0')}
            </span>
            <button
                onClick={() => handleNavigation('next')}
                disabled={currentPage === totalPages}
                className={styles.navButton}
                aria-label="Próximo"
            >
                &gt;
            </button>
            </div>
        )}
      </div>
      <div
        className={`${styles.carousel} ${isDragging ? styles.active : ""}`}
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {centers.map((center) => (
          <div className={styles.cardWrapper} key={center._id}>
            <TrainingCenterCard center={center} />
          </div>
        ))}
      </div>
    </section>
  );
}