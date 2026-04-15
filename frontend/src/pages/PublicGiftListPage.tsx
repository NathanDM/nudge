import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicClient from '../api/publicClient';
import { PublicGift } from '../types';

interface PublicList {
  ownerName: string;
  gifts: PublicGift[];
}

function GiftRow({
  gift,
  token,
  onClaim,
  onRefresh,
}: {
  gift: PublicGift;
  token: string;
  onClaim: (id: string) => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    setLoading(true);
    setError('');
    onClaim(gift.id);
    try {
      await publicClient.post(`/public/share/${token}/gifts/${gift.id}/claim`);
      onRefresh();
    } catch (err: any) {
      onClaim('__rollback__' + gift.id);
      onRefresh();
      if (err?.response?.status === 409)
        setError('Ce cadeau vient d\'être pris');
      else setError('Erreur, réessayez');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-sm truncate">{gift.title}</p>
        {gift.description && (
          <p className="text-xs text-gray-500 truncate">{gift.description}</p>
        )}
        {gift.price != null && (
          <p className="text-xs text-gray-400">{(gift.price / 100).toFixed(0)} €</p>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      {gift.claimedByName ? (
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full shrink-0">
          Réservé par {gift.claimedByName}
        </span>
      ) : gift.isClaimed ? (
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full shrink-0">
          Quelqu'un s'en occupe
        </span>
      ) : (
        <button
          onClick={handleClaim}
          disabled={loading}
          className="text-xs bg-blush text-white px-3 py-1.5 rounded-lg hover:bg-sage transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? '...' : 'Je prends ce cadeau'}
        </button>
      )}
    </div>
  );
}

export default function PublicGiftListPage() {
  const { token } = useParams<{ token: string }>();
  const [list, setList] = useState<PublicList | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicClient
      .get<PublicList>(`/public/share/${token}`)
      .then((r) => setList(r.data))
      .catch(() => setError('Ce lien n\'est plus valide.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRefresh = () => {
    publicClient
      .get<PublicList>(`/public/share/${token}`)
      .then((r) => setList(r.data))
      .catch(() => {});
  };

  const handleClaim = (id: string) => {
    if (id.startsWith('__rollback__')) {
      const realId = id.replace('__rollback__', '');
      setClaimedIds((prev) => { const next = new Set(prev); next.delete(realId); return next; });
    } else {
      setClaimedIds((prev) => new Set(prev).add(id));
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Chargement...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-gray-600">{error}</p>
      <Link to="/login" className="text-sm text-blush hover:text-sage">
        Accéder à Nudge
      </Link>
    </div>
  );

  if (!list) return null;

  const gifts = list.gifts.map((g) => ({
    ...g,
    isClaimed: g.isClaimed || claimedIds.has(g.id),
  }));

  return (
    <div className="min-h-screen bg-white px-4 py-8 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-1">
        Liste de {list.ownerName}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        Réservez un cadeau pour éviter les doublons.
      </p>

      {gifts.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun cadeau pour l'instant.</p>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white px-4">
          {gifts.map((g) => (
            <GiftRow key={g.id} gift={g} token={token!} onClaim={handleClaim} onRefresh={handleRefresh} />
          ))}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Gérez vos propres listes de cadeaux sur Nudge.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blush text-white text-sm px-5 py-2.5 rounded-lg hover:bg-sage transition-colors"
        >
          Rejoindre Nudge
        </Link>
      </div>
    </div>
  );
}
