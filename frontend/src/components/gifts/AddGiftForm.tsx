import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { Gift } from '../../types';

type GiftPayload = {
  title: string; description?: string; url?: string; price?: number; imageUrl?: string; secret?: boolean;
};

interface Props {
  forUserId: string;
  gift?: Gift;
  mode?: 'own' | 'secret';
  secret?: boolean;
  onSuccess?: () => void;
  formId?: string;
  onStateChange?: (state: { canSubmit: boolean; isPending: boolean }) => void;
}

export default function AddGiftForm({ forUserId, gift, mode = 'own', secret, onSuccess, formId, onStateChange }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(gift?.title ?? '');
  const [description, setDescription] = useState(gift?.description ?? '');
  const [url, setUrl] = useState(gift?.url ?? '');
  const [price, setPrice] = useState(gift?.price ? String(gift.price / 100) : '');
  const [image, setImage] = useState(gift?.ogImageUrl ?? '');
  const isSecret = mode === 'secret';
  const isEdit = !!gift;

  const mutation = useMutation({
    mutationFn: (data: GiftPayload) =>
      isEdit ? apiClient.patch(`/gifts/${gift.id}`, data) : apiClient.post(`/users/${forUserId}/gifts`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] });
      setTitle('');
      setDescription('');
      setUrl('');
      setPrice('');
      setImage('');
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
      imageUrl: image || undefined,
      secret: isEdit ? undefined : secret ?? isSecret,
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

      <ImageField value={image} onChange={setImage} inputClass={inputClass} inputStyle={inputStyle}/>

      {!formId && (
        <button
          type="submit"
          disabled={(!title && !url) || mutation.isPending}
          className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40 mt-2"
          style={{ background: isSecret ? 'var(--salmon)' : 'var(--sage)' }}
        >
          {mutation.isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : isSecret ? 'Ajouter en secret' : 'Ajouter'}
        </button>
      )}
    </form>
  );
}

function ImageField({ value, onChange, inputClass, inputStyle }: {
  value: string; onChange: (v: string) => void; inputClass: string; inputStyle: React.CSSProperties;
}) {
  return (
    <div>
      <label htmlFor="gift-image" className="block text-[12px] font-bold mb-1.5" style={{ color: 'var(--ink)' }}>
        Image (optionnel)
      </label>
      <div className="flex items-center gap-2">
        {value && <img src={value} alt="Aperçu" className="w-11 h-11 rounded-lg object-cover shrink-0" style={inputStyle}/>}
        <input
          id="gift-image"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/image.jpg"
          className={inputClass}
          style={inputStyle}
        />
      </div>
      <p className="text-[11px] mt-1" style={{ color: 'var(--ink-soft)' }}>Remplace l'image récupérée depuis le lien.</p>
    </div>
  );
}
