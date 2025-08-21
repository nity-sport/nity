import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function CoachDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [coach, setCoach] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/coach/${id}`)
        .then(res => res.json())
        .then(setCoach);
    }
  }, [id]);

  if (!coach) return <p>Carregando...</p>;

  return (
    <div>
      <h1>{coach.name}</h1>
      {coach.profileImage && (
        <img src={coach.profileImage} alt={coach.name} width={200} />
      )}
      <p>Idade: {coach.age}</p>
      <p>{coach.miniBio}</p>
    </div>
  );
}
