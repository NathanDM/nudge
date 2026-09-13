function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

type SheetProps = { open: boolean; onClose: () => void; title: string; children: React.ReactNode };

export function Sheet({ open, onClose, title, children }: SheetProps) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}/>
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
           style={{ boxShadow: '0 -20px 40px -20px rgba(0,0,0,.2)', maxHeight: '92%' }}>
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1.5 rounded-full bg-black/10"/>
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h3 className="display text-[19px] font-bold" style={{ color: 'var(--ink)' }}>{title}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(31,27,23,0.06)', color: 'var(--ink-soft)' }} aria-label="Fermer">
            <XIcon/>
          </button>
        </div>
        <div className="px-5 pb-8 overflow-y-auto phone-scroll" style={{ maxHeight: '75vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
