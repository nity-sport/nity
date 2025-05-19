import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../CoachForm.module.css";

export default function EditCoach() {
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [miniBio, setMiniBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/coach/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setName(data.name);
          setAge(data.age);
          setMiniBio(data.miniBio);
          setProfileImage(data.profileImage);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/coach/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, miniBio, profileImage }),
    });

    router.push(`/coach/${id}`);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>Editar Coach</h1>

      <label>Nome</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required />

      <label>Idade</label>
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />

      <label>Mini Bio</label>
      <textarea value={miniBio} onChange={(e) => setMiniBio(e.target.value)} />

      <label>Foto de Perfil (URL)</label>
      <input
        value={profileImage}
        onChange={(e) => setProfileImage(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
