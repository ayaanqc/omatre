import React, { useState, useMemo } from 'react';
import { Modal, Drawer, Badge, Button } from '../common/Primitives.jsx';
import { formatCurrency } from '../../utils/currency.js';

function scoreMatch(table, guest) {
  let score = 100;
  const sizeDiff = Math.abs((table?.capacity || 4) - guest.partySize);
  score -= sizeDiff * 18;
  score -= Math.max(0, guest.elapsedWaitMins - 20);
  if (guest.vipTier !== 'STANDARD') score += 15;
  if ((table?.capacity || 4) < guest.partySize) score -= 50;
  return score;
}

export function TableReleaseModal({ open, table, waitlist, onClose, onConfirm }) {
  const candidates = useMemo(() => {
    if (!table) return [];
    return waitlist.filter((w) => w.status === 'WAITING').map((w) => ({ ...w, matchScore: scoreMatch(table, w) })).sort((a, b) => b.matchScore - a.matchScore);
  }, [table, waitlist]);
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState('');
  React.useEffect(() => { if (open && candidates.length) setSelectedId(candidates[0].id); if (open) setNote(''); }, [open, table]);
  if (!table) return null;
  const selected = candidates.find((c) => c.id === selectedId);
  return (
    <Modal open={open} onClose={onClose} wide eyebrow="Triage / Step 1 of 2" title={`Release Table ${table.tableNumber} and re-seat`}>
      <div className="bg-[#2A1510] border border-[#5A2A1A] rounded-[10px] p-4 text-[13px] leading-snug">
        <p className="font-bold text-console-50">Forfeit: {table.partyName} ({table.partySize}-top, res. {table.reservationTime}).</p>
        <p className="text-console-300 mt-1">{table.turnDurationMins}m past reservation. Two contact attempts logged. {formatCurrency(table.estimatedFinalSpend)} yield at risk.</p>
      </div>
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-console-400 mt-6 mb-2">Ranked bar queue</h3>
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1" role="radiogroup" aria-label="Select waitlist party">
        {candidates.length === 0 && <p className="text-[13px] text-console-300 bg-console-800 border border-console-600 rounded-[10px] p-4">No waiting parties. Add a walk-in first.</p>}
        {candidates.map((c, i) => (
          <label key={c.id} className={`flex gap-3 items-start rounded-[10px] border p-3 cursor-pointer tactile-button ${selectedId === c.id ? 'border-bistro-brass bg-console-800' : 'border-console-600 bg-console-950 hover:border-console-400'}`}>
            <input type="radio" name="waitlist-match" checked={selectedId === c.id} onChange={() => setSelectedId(c.id)} className="mt-1 accent-[#C9A86A]" />
            <span className="flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-serif font-semibold text-[15px] text-console-50">{c.guestName}</span>
                {i === 0 && <Badge tone="success">Best match</Badge>}
                {c.vipTier !== 'STANDARD' && <Badge tone="vip">{c.vipTier.replace('_', ' ')}</Badge>}
              </span>
              <span className="block text-[12px] text-console-300 mt-1">{c.partySize}-top : waited {c.elapsedWaitMins}m : {formatCurrency(c.estimatedSpend)}{c.allergies?.length ? ` : ${c.allergies.join(', ')}` : ''}</span>
            </span>
          </label>
        ))}
      </div>
      <label htmlFor="triage-note" className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-console-400 mt-4 mb-2">Pass note (optional)</label>
      <input id="triage-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Fire mains on seating" className="w-full rounded-[8px] border border-console-600 bg-console-950 px-3 py-2.5 text-[13px] text-console-50 focus:outline-none focus:ring-2 focus:ring-bistro-brass" />
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        <Button variant="outline" onClick={onClose} className="sm:w-32">Cancel</Button>
        <Button variant="accent" disabled={!selected} onClick={() => selected && onConfirm(table.id, selected.id, null, note)} className="flex-1">Release T{table.tableNumber} and seat {selected ? selected.guestName.split('&')[0].trim() : 'party'}</Button>
      </div>
    </Modal>
  );
}

export function ExpediterSlipModal({ open, slip, onClose, onCopy }) {
  const [copied, setCopied] = useState(false);
  React.useEffect(() => { if (open) setCopied(false); }, [open, slip]);
  const handleCopy = async () => {
    if (!slip) return;
    try { await navigator.clipboard.writeText(slip.formattedTicket); } catch (e) {
      const ta = document.createElement('textarea'); ta.value = slip.formattedTicket; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {} document.body.removeChild(ta);
    }
    setCopied(true); onCopy(slip.id);
  };
  return (
    <Modal open={open} onClose={onClose} eyebrow="Triage / Step 2 of 2" title={slip ? `Expediter slip : Table ${slip.tableNumber}` : 'Expediter slip'}>
      {!slip && <p className="text-[13px] text-console-300">No slip yet.</p>}
      {slip && (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge tone="brass">{slip.slipCode}</Badge>
            <Badge tone={slip.allergies?.length ? 'alert' : 'success'}>{slip.allergies?.length ? slip.allergies.join(', ') : 'No allergies'}</Badge>
            <Badge tone="neutral">{slip.timestamp}</Badge>
          </div>
          <pre className="font-mono text-[12px] leading-relaxed bg-paper-50 text-paper-900 rounded-[10px] p-4 overflow-x-auto whitespace-pre-wrap">{slip.formattedTicket}</pre>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={onClose} className="sm:w-32">Close</Button>
            <Button variant="primary" onClick={handleCopy} className="flex-1">{copied ? 'Copied to clipboard' : 'Copy slip to chef pass'}</Button>
          </div>
          {copied && <p role="status" className="text-[12px] font-bold text-bistro-sage mt-2">Slip copied. Pass to Head Chef Nikolaj.</p>}
        </>
      )}
    </Modal>
  );
}

export function WaitlistDrawer({ open, onClose, waitlist, onSeat, onAdd }) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ guestName: '', partySize: 2, quotedWaitMins: 20, vipTier: 'STANDARD', allergies: '', estimatedSpend: 300, notes: '' });
  const [error, setError] = useState('');
  const waiting = waitlist.filter((w) => w.status === 'WAITING');
  const submit = (e) => {
    e.preventDefault();
    if (!form.guestName.trim()) { setError('Guest name is required.'); return; }
    if (Number(form.partySize) < 1 || Number(form.partySize) > 12) { setError('Party size must be 1 to 12.'); return; }
    onAdd({ ...form, allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean) });
    setForm({ guestName: '', partySize: 2, quotedWaitMins: 20, vipTier: 'STANDARD', allergies: '', estimatedSpend: 300, notes: '' });
    setError(''); setFormOpen(false);
  };
  const input = 'mt-1 w-full rounded-[8px] border border-console-600 bg-console-950 px-3 py-2 text-[13px] text-console-50 focus:outline-none focus:ring-2 focus:ring-bistro-brass';
  return (
    <Drawer open={open} onClose={onClose} eyebrow="Bar queue / Live" title={`Waitlist (${waiting.length})`}>
      <Button variant="primary" onClick={() => setFormOpen(!formOpen)} className="w-full mb-4">{formOpen ? 'Hide walk-in form' : 'Add walk-in guest'}</Button>
      {formOpen && (
        <form onSubmit={submit} className="bg-console-800 border border-console-600 rounded-[10px] p-4 mb-4 flex flex-col gap-2">
          {error && <p role="alert" className="text-[12px] font-bold text-bistro-terracotta bg-[#2A1510] border border-[#5A2A1A] rounded-[8px] px-2.5 py-2">{error}</p>}
          <label className="text-[12px] font-bold text-console-50">Guest name<input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="e.g. Astrup Party" className={input} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[12px] font-bold text-console-50">Party size<input type="number" min="1" max="12" value={form.partySize} onChange={(e) => setForm({ ...form, partySize: e.target.value })} className={input} /></label>
            <label className="text-[12px] font-bold text-console-50">Est. spend<input type="number" min="0" value={form.estimatedSpend} onChange={(e) => setForm({ ...form, estimatedSpend: e.target.value })} className={input} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[12px] font-bold text-console-50">Tier<select value={form.vipTier} onChange={(e) => setForm({ ...form, vipTier: e.target.value })} className={input}><option>STANDARD</option><option>HOUSE_REGULAR</option><option>CONCIERGE</option><option>MICHELIN_CRITIC</option></select></label>
            <label className="text-[12px] font-bold text-console-50">Quoted (m)<input type="number" min="0" value={form.quotedWaitMins} onChange={(e) => setForm({ ...form, quotedWaitMins: e.target.value })} className={input} /></label>
          </div>
          <label className="text-[12px] font-bold text-console-50">Allergies (comma separated)<input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Severe Shellfish" className={input} /></label>
          <Button variant="sage" type="submit">Save to queue</Button>
        </form>
      )}
      <div className="flex flex-col gap-2">
        {waiting.map((w) => (
          <div key={w.id} className="bg-console-800 border border-console-600 rounded-[10px] p-4">
            <div className="flex items-start justify-between gap-2">
              <div><p className="font-serif text-[15px] font-semibold text-console-50">{w.guestName}</p><p className="font-mono text-[11px] text-console-400 mt-0.5">{w.id} : {w.partySize}-top : {w.elapsedWaitMins}m waited</p></div>
              {w.vipTier !== 'STANDARD' && <Badge tone="vip">{w.vipTier.replace('_', ' ')}</Badge>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge tone="neutral">{formatCurrency(w.estimatedSpend)}</Badge>
              {w.allergies?.map((a) => <Badge key={a} tone="alert">{a}</Badge>)}
            </div>
            <Button variant="dark" size="sm" onClick={() => onSeat(w)} className="w-full mt-3">Quick match</Button>
          </div>
        ))}
        {waiting.length === 0 && <p className="text-[13px] text-console-300 bg-console-800 border border-console-600 rounded-[10px] p-4">Queue clear.</p>}
      </div>
    </Drawer>
  );
}

export function ShiftLogDrawer({ open, onClose, logs, slips, onCopySlip, onViewSlip, initialTab = 'log' }) {
  const [tab, setTab] = useState(initialTab);
  React.useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);
  return (
    <Drawer open={open} onClose={onClose} eyebrow="Audit / Persisted" title={tab === 'log' ? 'Service log' : `Slips (${slips.length})`}>
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Log or slips">
        <button role="tab" aria-selected={tab === 'log'} onClick={() => setTab('log')} className={`tactile-button flex-1 rounded-[8px] border px-3 py-2 text-[12px] font-bold ${tab === 'log' ? 'bg-bistro-brass text-console-950 border-bistro-brass' : 'bg-console-800 border-console-600 text-console-300'}`}>Log</button>
        <button role="tab" aria-selected={tab === 'slips'} onClick={() => setTab('slips')} className={`tactile-button flex-1 rounded-[8px] border px-3 py-2 text-[12px] font-bold ${tab === 'slips' ? 'bg-bistro-brass text-console-950 border-bistro-brass' : 'bg-console-800 border-console-600 text-console-300'}`}>Slips</button>
      </div>
      {tab === 'log' ? (
        <ol className="flex flex-col">
          {logs.map((l) => (
            <li key={l.id} className="py-3 border-b border-console-700">
              <p className="font-mono text-[11px] text-console-400">{l.timestamp} : {l.action.replace('_', ' ')} {l.tableNumber ? `: T${l.tableNumber}` : ''}</p>
              <p className="text-[13px] font-bold text-console-50 mt-0.5">{l.partyName}</p>
              <p className="text-[12px] text-console-300">{l.details}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col gap-2">
          {slips.map((s) => (
            <div key={s.id} className="bg-console-800 border border-console-600 rounded-[10px] p-3">
              <div className="flex flex-wrap gap-1.5 mb-2"><Badge tone="brass">{s.slipCode}</Badge><Badge tone="neutral">T{s.tableNumber}</Badge></div>
              <p className="text-[13px] font-bold text-console-50">{s.partyName} : {s.partySize} covers</p>
              <div className="flex gap-2 mt-2">
                <Button variant="dark" size="sm" onClick={() => onViewSlip(s)} className="flex-1">View</Button>
                <Button variant="outline" size="sm" onClick={() => onCopySlip(s)} className="flex-1">Copy</Button>
              </div>
            </div>
          ))}
          {slips.length === 0 && <p className="text-[13px] text-console-300 bg-console-800 border border-console-600 rounded-[10px] p-4">No slips yet. Release Table 14 first.</p>}
        </div>
      )}
    </Drawer>
  );
}
