import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'tactile-button inline-flex items-center justify-center font-bold rounded-[8px] border focus:outline-none focus-visible:ring-2 focus-visible:ring-bistro-brass focus-visible:ring-offset-2 focus-visible:ring-offset-console-950 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-bistro-brass text-console-950 border-bistro-brass hover:bg-[#D9BC82] hover:border-[#D9BC82]',
    accent: 'bg-bistro-terracotta text-white border-bistro-terracotta hover:bg-[#EF7E52] hover:border-[#EF7E52]',
    dark: 'bg-console-800 text-console-50 border-console-600 hover:border-bistro-brass hover:bg-console-700',
    outline: 'bg-transparent text-console-50 border-console-600 hover:border-bistro-brass hover:text-bistro-brass',
    ghost: 'bg-transparent text-console-300 border-transparent hover:bg-console-800 hover:text-console-50',
    sage: 'bg-bistro-sage text-console-950 border-bistro-sage hover:brightness-110',
  };
  const sizes = {
    sm: 'text-[12px] px-3 py-1.5 gap-1.5',
    md: 'text-[13px] px-4 py-2.5 gap-2',
    lg: 'text-[14px] px-6 py-3 gap-2',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-console-800 text-console-300 border-console-600',
    alert: 'bg-[#2A1510] text-bistro-terracotta border-[#5A2A1A]',
    caution: 'bg-[#241C0D] text-bistro-ochre border-[#5A4517]',
    success: 'bg-[#10201A] text-bistro-sage border-[#1E4433]',
    vip: 'bg-[#221C0E] text-bistro-brass border-[#5A4A22]',
    brass: 'bg-bistro-brass text-console-950 border-bistro-brass',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-[6px] border px-2 py-[3px] text-[11px] font-bold uppercase tracking-[0.06em] leading-none ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, eyebrow, children, wide = false }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/70 cursor-pointer" />
      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-console-900 border border-console-600 rounded-t-[14px] sm:rounded-[14px] shadow-paper-lg max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-console-700">
          <div>
            {eyebrow && <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-console-400 mb-1">{eyebrow}</p>}
            <h2 className="font-serif text-[22px] leading-tight font-semibold text-console-50">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="tactile-button shrink-0 w-8 h-8 rounded-[8px] border border-console-600 bg-console-800 hover:border-bistro-brass hover:text-bistro-brass flex items-center justify-center text-console-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, eyebrow, children }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close panel" onClick={onClose} className="absolute inset-0 bg-black/70 cursor-pointer" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-console-900 border-l border-console-600 shadow-paper-lg flex flex-col">
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-console-700">
          <div>
            {eyebrow && <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-console-400 mb-1">{eyebrow}</p>}
            <h2 className="font-serif text-[20px] font-semibold text-console-50">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="tactile-button shrink-0 w-8 h-8 rounded-[8px] border border-console-600 bg-console-800 hover:border-bistro-brass flex items-center justify-center text-console-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(92vw,360px)]">
      {toasts.map((t) => (
        <div key={t.id} className="bg-console-800 text-console-50 border border-console-600 border-l-2 border-l-bistro-brass rounded-[10px] shadow-paper-lg p-4 flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold leading-tight">{t.title}</p>
            <p className="text-[12px] leading-snug text-console-300 mt-1">{t.message}</p>
          </div>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification" className="tactile-button text-console-400 hover:text-console-50 hover:bg-console-700 rounded-[6px] w-6 h-6 flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
