import { Family } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import MemberCard from './MemberCard';

interface Props {
  family: Family;
}

export default function FamilyGroup({ family }: Props) {
  const { user } = useAuth();

  // Sort: current user first, then alphabetically
  const sorted = [...family.members].sort((a, b) => {
    if (a.id === user?.id) return -1;
    if (b.id === user?.id) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-teal mb-3">
        Famille {family.name}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sorted.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
