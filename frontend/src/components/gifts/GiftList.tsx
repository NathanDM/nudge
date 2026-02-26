import { Gift } from '../../types';
import GiftCard from './GiftCard';

interface Props {
  gifts: Gift[];
  forUserId: string;
  isOwnList: boolean;
}

export default function GiftList({ gifts, forUserId, isOwnList }: Props) {
  if (gifts.length === 0) {
    return (
      <div className="text-center text-dark-sage py-8 bg-white/50 rounded-xl">
        Aucune idée de cadeau pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          forUserId={forUserId}
          isOwnList={isOwnList}
        />
      ))}
    </div>
  );
}
