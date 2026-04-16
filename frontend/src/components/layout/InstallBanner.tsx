import { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      onClick={onDismiss}
      className="shrink-0 text-gray-300 hover:text-gray-400 transition-colors"
      aria-label="Fermer"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  );
}

function IosBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-40">
      <div className="bg-white rounded-2xl shadow-lg border border-blush px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center shrink-0 text-xl">
            🎁
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Ajouter à l'écran d'accueil</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Appuie sur{' '}
              <svg className="inline w-4 h-4 -mt-0.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            {' '}puis <span className="font-medium text-gray-700">« Sur l'écran d'accueil »</span>
            </p>
          </div>
          <DismissButton onDismiss={onDismiss} />
        </div>
      </div>
    </div>
  );
}

export default function InstallBanner() {
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('install-dismissed') === '1');

  const dismiss = () => {
    localStorage.setItem('install-dismissed', '1');
    setDismissed(true);
  };

  if (dismissed || isInStandaloneMode) return null;

  if (isIos) return <IosBanner onDismiss={dismiss} />;

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40">
      <div className="bg-white rounded-2xl shadow-lg border border-blush px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center shrink-0 text-xl">
          🎁
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Ajouter à l'écran d'accueil</p>
          <p className="text-xs text-gray-400 truncate">Accède à Nudge en un tap</p>
        </div>
        <button
          onClick={install}
          className="shrink-0 bg-salmon text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all"
        >
          Installer
        </button>
        <DismissButton onDismiss={dismiss} />
      </div>
    </div>
  );
}
