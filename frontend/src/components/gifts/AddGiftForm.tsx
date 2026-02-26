import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface Props {
  forUserId: string;
}

export default function AddGiftForm({ forUserId }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');

  const mutation = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      url?: string;
      price?: number;
    }) => apiClient.post(`/users/${forUserId}/gifts`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', forUserId] });
      setTitle('');
      setDescription('');
      setUrl('');
      setPrice('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      description: description || undefined,
      url: url || undefined,
      price: price ? Math.round(parseFloat(price) * 100) : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-4 shadow-sm mb-6"
    >
      <h3 className="font-medium text-teal mb-3">Ajouter une idée</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Titre *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-sage/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-sage/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="Lien (URL)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-sage/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
          <input
            type="number"
            placeholder="Prix (€)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0"
            className="w-28 border border-sage/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
        </div>
        <button
          type="submit"
          disabled={!title || mutation.isPending}
          className="bg-sage text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-dark-sage transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
