'use client'; // Se estiver usando App Router, senão não é necessário para Pages Router
import React, { useEffect, useState, useRef } from 'react';
import { ExperienceType } from '../../../src/types/experience'; // Ajuste o caminho
import ExperienceCard from '../../cards/ExperienceCard';
import styles from './ExperiencesSection.module.css';

interface ExperiencesSectionProps {
  title?: string;
  filter?: 'tour' | 'event'; // Opcional para filtrar por categoria
}

const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({
  title = 'Experiences',
  filter,
}) => {
  const [experiences, setExperiences] = useState<ExperienceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  // Drag & Touch Handlers (copiado da sua SportsSection)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/experiences'); // GET request
        if (!response.ok) {
          throw new Error('Falha ao buscar experiências');
        }
        const data = await response.json();
        // A API retorna { experiences: [...], pagination: {...} }
        if (data.experiences) {
          let fetchedExperiences = data.experiences as ExperienceType[];
          if (filter) {
            fetchedExperiences = fetchedExperiences.filter(
              exp => exp.category === filter
            );
          }
          setExperiences(fetchedExperiences);
        } else {
          throw new Error(
            data.error || 'Erro ao processar dados das experiências'
          );
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Erro ao buscar experiências:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [filter]);

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
    const walk = (x - startX) * 1.5; // Multiplicador para sensibilidade
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>Carregando experiências...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.messageError}>Erro: {error}</p>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>Nenhuma experiência encontrada.</p>
      </div>
    );
  }

  return (
    <section className={styles.experiencesSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div
        className={`${styles.carousel} ${isDragging ? styles.active : ''}`}
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {experiences.map(experience => (
          <ExperienceCard key={experience._id} experience={experience} />
        ))}
      </div>
    </section>
  );
};

export default ExperiencesSection;
