import { useState } from 'react';
import styles from './CoachForm.module.css';

export default function CreateCoachPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(0);
  const [miniBio, setMiniBio] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let uploadedUrl = '';

    try {
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Erro no upload: ${errorText}`);
        }

        const data = await uploadRes.json();
        uploadedUrl = data.url;
      }

      const coachData = {
        name,
        age,
        miniBio,
        profileImage: uploadedUrl,
      };

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coachData),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Erro ao salvar coach: ${error}`);
      }

      window.location.href = '/coach';
    } catch (err) {
      console.error('Erro geral:', err);
      alert('Erro ao enviar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>Cadastrar Coach</h1>

      <label>Nome</label>
      <input
        type='text'
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <label>Idade</label>
      <input
        type='number'
        value={age}
        onChange={e => setAge(Number(e.target.value))}
        required
      />

      <label>Mini Bio</label>
      <textarea value={miniBio} onChange={e => setMiniBio(e.target.value)} />

      <label>Foto de Perfil</label>
      <input type='file' accept='image/*' onChange={handleImageChange} />

      {preview && (
        <img src={preview} alt='preview' className={styles.preview} />
      )}

      <button type='submit' disabled={loading}>
        {loading ? 'Enviando...' : 'Salvar'}
      </button>
    </form>
  );
}
