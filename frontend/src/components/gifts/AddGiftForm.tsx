import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface Props {
  forUserId: string;
  mode?: 'own' | 'secret';
  secret?: boolean;
  onSuccess?: () => void;
  formId?: string;
  onStateChange?: (state: { canSubmit: boolean; isPending: boolean }) => void;
}

export default function AddGiftForm({ forUserId, mode = 'own', secret, onSuccess, formId, onStateChange }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const isSecret = mode === 'secret';

  const mutation = useMutation({
    mutationFn: (data: { title: string; description?: string; url?: string; price?: number; secret?: boolean }) =>
      apiClient.post(`/users/${forUserId}/gifts`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] });
      setTitle('');
      setDescription('');
      setUrl('');
      setPrice('');
      onSuccess?.();
    },
  });

  useEffect(() => {
    onStateChange?.({ canSubmit: !!(title || url), isPending: mutation.isPending });
  }, [title, url, mutation.isPending, onStateChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      description: description || undefined,
      url: url || undefined,
      price: price ? Math.round(parseFloat(price) * 100) : undefined,
      secret: secret ?? (mode === 'secret'),
    });
  };

  const inputClass = 'w-full rounded-xl px-3.5 py-3 text-[14px] bg-white outline-none focus:ring-2 focus:ring-blush';
  const inputStyle = { border: '1.5px solid rgba(238,215,207,0.6)' };

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3 pb-2">
      <div>
        <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex. Théière en fonte"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Description (optionnel)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Couleur, taille, marque…"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Prix indicatif (optionnel)</label>
        <div className="relative">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="45"
            step="0.01"
            min="0"
            className={`${inputClass} pr-8`}
            style={inputStyle}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-semibold" style={{ color: 'var(--ink-mute)' }}>€</span>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>Lien (optionnel)</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {!formId && (
        <button
          type="submit"
          disabled={(!title && !url) || mutation.isPending}
          className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40 mt-2"
          style={{ background: isSecret ? 'var(--salmon)' : 'var(--sage)' }}
        >
          {mutation.isPending ? 'Ajout…' : isSecret ? 'Ajouter en secret' : 'Ajouter'}
        </button>
      )}
    </form>
  );
}
