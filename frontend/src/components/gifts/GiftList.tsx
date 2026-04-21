import { Gift } from '../../types';
import GiftCard from './GiftCard';

interface Props {
  gifts: Gift[];
  forUserId: string;
  isOwnList: boolean;
}

export default function GiftList({ gifts, forUserId, isOwnList }: Props) {
  if (gifts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {gifts.map((gift) => (
        <GiftCard key={gift.id} gift={gift} forUserId={forUserId} isOwnList={isOwnList}/>
      ))}
    </div>
  );
}
