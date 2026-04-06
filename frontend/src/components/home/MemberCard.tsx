import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  member: User;
}

export default function MemberCard({ member }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMe = user?.id === member.id;

  return (
    <button
      onClick={() => navigate(`/user/${member.id}`)}
      className={`w-full text-left rounded-xl p-4 transition-all hover:shadow-md ${
        isMe
          ? 'bg-sage text-white ring-2 ring-dark-sage'
          : 'bg-white hover:bg-white/80'
      }`}
    >
      <span className="font-medium">
        {member.name}
        {isMe && ' (Ma liste)'}
      </span>
    </button>
  );
}
