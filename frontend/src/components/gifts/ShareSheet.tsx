import { useState } from 'react';
import { Sheet } from '../layout/Sheet';

function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>;
}
function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>;
}
function ChatIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-4 4v-4H6a2 2 0 0 1-2-2z"/></svg>;
}

export type ShareSubject = { kind: 'self' } | { kind: 'child'; name: string };

function copy(subject: ShareSubject) {
  if (subject.kind === 'child') return {
    title: `Partager la liste de ${subject.name}`,
    intro: `Génère un lien public pour que vos proches voient la liste de ${subject.name} — même sans compte.`,
    whoTitle: `Qui peut voir la liste de ${subject.name} ?`,
    who: ['• Vos proches, s’ils sont déjà sur Nudge.', '• Toute personne avec ce lien, sans compte.'],
    whoEmphasis: `• Toi, tu vois qui a réservé quoi — ${subject.name} non.`,
  };
  return {
    title: 'Partager ma liste',
    intro: 'Génère un lien public pour que tes proches voient ta liste — même sans compte.',
    whoTitle: 'Qui peut voir ta liste ?',
    who: ['• Tes proches, s’ils sont déjà sur Nudge.', '• Toute personne avec ce lien, sans compte.'],
    whoEmphasis: '• Toi, tu ne verras jamais qui a réservé quoi.',
  };
}

type ShareSheetProps = {
  open: boolean;
  onClose: () => void;
  subject: ShareSubject;
  shareToken: string | null;
  onGenerateToken: () => void;
  generating: boolean;
  onRevoke: () => void;
  revoking: boolean;
};

export function ShareSheet({ open, onClose, subject, shareToken, onGenerateToken, generating, onRevoke, revoking }: ShareSheetProps) {
  const text = copy(subject);
  return (
    <Sheet open={open} onClose={onClose} title={text.title}>
      {!shareToken ? (
        <GenerateStep intro={text.intro} onGenerate={onGenerateToken} generating={generating}/>
      ) : (
        <>
          <ShareLink shareToken={shareToken}/>
          <WhoCanSee title={text.whoTitle} lines={text.who} emphasis={text.whoEmphasis}/>
          <ShareActions shareUrl={`${window.location.origin}/share/${shareToken}`}/>
          <RevokeRow onRevoke={onRevoke} revoking={revoking}/>
        </>
      )}
    </Sheet>
  );
}

function GenerateStep({ intro, onGenerate, generating }: { intro: string; onGenerate: () => void; generating: boolean }) {
  return (
    <div className="pt-4 flex flex-col items-center gap-4">
      <p className="text-[13px] text-center" style={{ color: 'var(--ink-soft)' }}>{intro}</p>
      <button onClick={onGenerate} disabled={generating}
        className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] disabled:opacity-40"
        style={{ background: 'var(--active)' }}>
        {generating ? 'Génération…' : 'Générer un lien de partage'}
      </button>
    </div>
  );
}

function ShareLink({ shareToken }: { shareToken: string }) {
  return (
    <div className="flex items-center gap-2 mt-2 mb-4 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(31,27,23,0.05)' }}>
      <LinkIcon/>
      <span className="text-[12px] font-bold truncate" style={{ color: 'var(--ink)' }}>{window.location.host}/share/{shareToken}</span>
    </div>
  );
}

function WhoCanSee({ title, lines, emphasis }: { title: string; lines: string[]; emphasis: string }) {
  return (
    <div className="rounded-2xl p-3.5 mb-3" style={{ background: 'rgba(165,200,191,0.15)', border: '1px solid rgba(165,200,191,0.35)' }}>
      <div className="text-[12px] font-bold mb-1.5" style={{ color: 'var(--active)' }}>{title}</div>
      <ul className="text-[12px] leading-relaxed space-y-0.5" style={{ color: 'var(--ink-soft)' }}>
        {lines.map((line) => <li key={line}>{line}</li>)}
        <li className="font-semibold" style={{ color: 'var(--ink)' }}>{emphasis}</li>
      </ul>
    </div>
  );
}

function ShareActions({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const encoded = encodeURIComponent(shareUrl);
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <button onClick={doCopy} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
              style={{ background: 'rgba(31,27,23,0.07)', color: 'var(--ink)' }}>
        {copied ? <CheckIcon/> : <CopyIcon/>}
        <span className="text-[11px] font-bold">{copied ? 'Copié' : 'Copier'}</span>
      </button>
      <a href={`sms:?body=${encoded}`} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
         style={{ background: 'rgba(165,200,191,0.25)', color: 'var(--active)' }}>
        <ChatIcon/>
        <span className="text-[11px] font-bold">SMS</span>
      </a>
      <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer"
         className="flex flex-col items-center gap-1.5 py-3 rounded-2xl active:scale-[0.97]"
         style={{ background: 'rgba(37,211,102,0.15)', color: '#128C7E' }}>
        <ChatIcon/>
        <span className="text-[11px] font-bold">WhatsApp</span>
      </a>
    </div>
  );
}

function RevokeRow({ onRevoke, revoking }: { onRevoke: () => void; revoking: boolean }) {
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return (
    <div className="border-t pt-4" style={{ borderColor: 'var(--line)' }}>
      <button onClick={() => setConfirm(true)} className="w-full text-center text-[12px] font-bold py-1" style={{ color: 'var(--ink-mute)' }}>
        Révoquer le lien de partage
      </button>
    </div>
  );
  return (
    <div className="border-t pt-4 flex items-center justify-between gap-3" style={{ borderColor: 'var(--line)' }}>
      <span className="text-[12px]" style={{ color: 'var(--ink-soft)' }}>Révoquer ce lien ?</span>
      <div className="flex items-center gap-3">
        <button onClick={() => setConfirm(false)} className="text-[12px] font-bold" style={{ color: 'var(--ink-mute)' }}>Annuler</button>
        <button onClick={() => { onRevoke(); setConfirm(false); }} disabled={revoking}
          className="text-[12px] font-bold disabled:opacity-50" style={{ color: '#B85563' }}>
          {revoking ? 'Révocation…' : 'Révoquer'}
        </button>
      </div>
    </div>
  );
}
