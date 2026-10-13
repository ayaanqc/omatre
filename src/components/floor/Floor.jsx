import React from 'react';
import { Badge, Button } from '../common/Primitives.jsx';
import { COURSE_STAGES } from '../../data/menuDietaryTypes.js';
import { formatCurrency } from '../../utils/currency.js';

export function MetricsStrip({ tables, waitlist }) {
  const seated = tables.filter((t) => t.status === 'SEATED').length;
  const late = tables.filter((t) => t.status === 'LATE_NO_SHOW');
  const finishing = tables.filter((t) => t.status === 'FINISHING').length;
  const banked = tables.reduce((s, t) => s + (t.spendToDate || 0), 0);
  const waiting = waitlist.filter((w) => w.status === 'WAITING');
  const cells = [
    { k: 'Banked', v: formatCurrency(banked), s: `${seated} seated active` },
    { k: 'At risk', v: late.length ? formatCurrency(late.reduce((s, t) => s + t.estimatedFinalSpend, 0)) : '$0', s: late.length ? `T${late.map((t) => t.tableNumber).join(', T')} past grace` : 'No grace lapse', alert: late.length > 0 },
    { k: 'Bar queue', v: `${waiting.length} waiting`, s: `Longest ${Math.max(0, ...waiting.map((w) => w.elapsedWaitMins || 0))}m` },
    { k: 'Closing', v: `${finishing} checks`, s: finishing ? 'Free within 10 min' : 'No checks this quarter' },
  ];
  return (
    <section aria-label="Yield strip" className="bg-console-900 border border-console-700 rounded-[12px] grid grid-cols-2 xl:grid-cols-4 divide-x divide-console-700 divide-y xl:divide-y-0">
      {cells.map((c) => (
        <div key={c.k} className="p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-console-400">{c.k}</p>
          <p className={`font-serif text-[24px] font-bold leading-none mt-1 ${c.alert ? 'text-bistro-terracotta' : 'text-console-50'}`}>{c.v}</p>
          <p className="text-[12px] text-console-300 mt-1">{c.s}</p>
        </div>
      ))}
    </section>
  );
}

// Spatial floor plan: replaces card grid with a clickable map.
const PLAN_POS = {
  'T-11': { x: 30, y: 40 }, 'T-12': { x: 150, y: 40 }, 'T-13': { x: 270, y: 40 },
  'T-14': { x: 390, y: 40 }, 'T-15': { x: 500, y: 40 }, 'T-16': { x: 610, y: 40 },
  'T-21': { x: 120, y: 190 }, 'T-22': { x: 280, y: 190 }, 'T-23': { x: 440, y: 190 },
  'T-31': { x: 80, y: 320 }, 'T-32': { x: 280, y: 320 }, 'T-33': { x: 480, y: 320 },
};

function nodeFill(t) {
  if (t.status === 'LATE_NO_SHOW') return '#E0683A';
  if (t.status === 'FINISHING') return '#343B43';
  if (t.vipStatus) return '#C9A86A';
  return '#2A2F35';
}
function nodeStroke(t, selected) {
  if (selected) return '#F4F1EA';
  if (t.status === 'LATE_NO_SHOW') return '#F4F1EA';
  return '#8A938F';
}

export function FloorPlanMap({ tables, selectedId, onSelect }) {
  return (
    <section aria-label="Floor plan map" className="bg-console-900 border border-console-700 rounded-[12px] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="font-serif text-[17px] font-semibold text-console-50"><span className="font-mono text-[11px] text-console-400 font-bold mr-2">04 /</span>Floor plan</h2>
        <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest text-console-400">
          <span><span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-bistro-terracotta mr-1" />Late</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-bistro-brass mr-1" />VIP seated</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-console-700 mr-1" />Active</span>
        </div>
      </div>
      <svg viewBox="0 0 720 400" role="group" aria-label="Clickable table map" className="w-full h-auto bg-console-950 border border-console-700 rounded-[10px]">
        <text x="24" y="24" fill="#8A938F" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="2">MAIN DINING ROOM</text>
        <text x="24" y="172" fill="#8A938F" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="2">CHEF'S COUNTER</text>
        <rect x="24" y="180" width="672" height="10" rx="5" fill="#2A2F35" />
        <text x="24" y="302" fill="#8A938F" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="2">PATIO GLASSHOUSE</text>
        {tables.map((t) => {
          const p = PLAN_POS[t.id] || { x: 30, y: 40 };
          const sel = selectedId === t.id;
          const w = t.capacity >= 6 ? 110 : 80;
          return (
            <g key={t.id} className="plan-node" tabIndex={0} role="button" aria-label={`Table ${t.tableNumber} ${t.partyName}`}
              onClick={() => onSelect(t.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.id); } }}>
              <rect x={p.x} y={p.y} width={w} height="56" rx="8" fill={nodeFill(t)} stroke={nodeStroke(t, sel)} strokeWidth={sel ? 2.5 : 1.25} />
              {t.status === 'LATE_NO_SHOW' && (
                <circle cx={p.x + w - 10} cy={p.y + 10} r="7" fill="#F4F1EA">
                  <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={p.x + 10} y={p.y + 24} fill={t.status === 'LATE_NO_SHOW' || t.vipStatus ? '#0B0D0E' : '#F4F1EA'} fontSize="15" fontWeight="800" fontFamily="Manrope">T{t.tableNumber}</text>
              <text x={p.x + 10} y={p.y + 42} fill={t.status === 'LATE_NO_SHOW' || t.vipStatus ? '#0B0D0E' : '#A8B0AB'} fontSize="10" fontWeight="700" fontFamily="Manrope">{(t.partyName || 'Open').slice(0, 14)}{t.turnDurationMins ? ` : ${t.turnDurationMins}m` : ''}</text>
            </g>
          );
        })}
      </svg>
      <p className="text-[12px] text-console-400 mt-3">Select a node to inspect cover detail. Pulsing marker indicates grace lapse requiring triage.</p>
    </section>
  );
}

export function LedgerTable({ tables, selectedId, onSelect }) {
  return (
    <section aria-label="Cover ledger" className="bg-console-900 border border-console-700 rounded-[12px] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-console-700">
        <h2 className="font-serif text-[17px] font-semibold"><span className="font-mono text-[11px] text-console-400 font-bold mr-2">05 /</span>Cover ledger</h2>
        <span className="font-mono text-[11px] text-console-400">{tables.length} covers</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] min-w-[720px]">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-console-400 border-b border-console-700">
              <th className="px-4 py-2.5 font-bold">Table</th>
              <th className="px-2 py-2.5 font-bold">Party</th>
              <th className="px-2 py-2.5 font-bold">Course</th>
              <th className="px-2 py-2.5 font-bold">Turn</th>
              <th className="px-2 py-2.5 font-bold">Spend</th>
              <th className="px-2 py-2.5 font-bold">Flags</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.id} onClick={() => onSelect(t.id)} aria-selected={selectedId === t.id} tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelect(t.id); }}
                className="ledger-row border-b border-console-700/60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bistro-brass">
                <td className="px-4 py-2.5 font-mono font-bold text-console-50">T{t.tableNumber}<span className="block text-[10px] font-sans font-medium text-console-400">{t.zone === 'MDR' ? 'MDR' : t.zone === 'PATIO' ? 'Patio' : 'Counter'} : {t.server}</span></td>
                <td className="px-2 py-2.5"><span className="font-serif font-semibold text-console-50">{t.partyName}</span><span className="block text-[11px] text-console-400">{t.partySize} guests : res {t.reservationTime}</span></td>
                <td className="px-2 py-2.5 text-console-300">{(COURSE_STAGES[t.currentCourse] || {}).label || t.currentCourse}</td>
                <td className={`px-2 py-2.5 font-mono font-bold ${t.status === 'LATE_NO_SHOW' ? 'text-bistro-terracotta' : 'text-console-50'}`}>{t.turnDurationMins}m<span className="text-console-400 font-medium">/{t.expectedDurationMins}m</span></td>
                <td className="px-2 py-2.5 font-bold text-console-50">{formatCurrency(t.spendToDate)}<span className="block text-[11px] font-medium text-console-400">est {formatCurrency(t.estimatedFinalSpend)}</span></td>
                <td className="px-2 py-2.5"><span className="flex flex-wrap gap-1">{t.status === 'LATE_NO_SHOW' && <Badge tone="alert">{t.turnDurationMins}m late</Badge>}{t.status === 'FINISHING' && <Badge tone="neutral">Check</Badge>}{t.vipStatus && <Badge tone="vip">VIP</Badge>}{t.allergies?.length > 0 && <Badge tone="alert">{t.allergies[0]}</Badge>}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TableDetail({ table, onRelease, onSlip, onAdvance }) {
  if (!table) return (
    <div className="bg-console-900 border border-console-700 rounded-[12px] p-6 text-[13px] text-console-300">Select a table node or ledger row to inspect service detail.</div>
  );
  const course = COURSE_STAGES[table.currentCourse] || {};
  const order = ['WATER_MENUS', 'FIRST_COURSE', 'MAINS', 'DESSERT', 'CHECK_DROPPED'];
  const next = table.status === 'SEATED' ? order.find((c) => COURSE_STAGES[c].order > (course.order ?? -1)) : null;
  return (
    <aside aria-label={`Table ${table.tableNumber} detail`} className={`bg-console-900 border rounded-[12px] p-6 flex flex-col gap-3 ${table.status === 'LATE_NO_SHOW' ? 'border-bistro-terracotta' : 'border-console-700'}`}>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-console-400">06 / Cover detail</p>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-[26px] font-bold leading-none">T{table.tableNumber}</h3>
        <span className="flex gap-1.5 flex-wrap justify-end">
          {table.status === 'LATE_NO_SHOW' && <Badge tone="alert">{table.turnDurationMins}m late</Badge>}
          {table.vipStatus && <Badge tone="vip">VIP</Badge>}
        </span>
      </div>
      <p className="font-serif text-[17px] font-semibold">{table.partyName} <span className="font-sans text-[12px] text-console-400 font-medium">: {table.partySize} guests : {table.zone} : {table.server}</span></p>
      <dl className="grid grid-cols-3 gap-2 text-center bg-console-950 border border-console-700 rounded-[10px] p-2">
        <div><dt className="font-mono text-[10px] uppercase tracking-widest text-console-400">Course</dt><dd className="text-[12px] font-bold text-console-50">{course.label || 'None'}</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-widest text-console-400">Turn</dt><dd className="text-[12px] font-bold text-console-50">{table.turnDurationMins}m / {table.expectedDurationMins}m</dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-widest text-console-400">Spend</dt><dd className="text-[12px] font-bold text-console-50">{formatCurrency(table.spendToDate)}</dd></div>
      </dl>
      {table.allergies?.length > 0 && <p className="text-[12px] font-bold text-bistro-terracotta bg-[#2A1510] border border-[#5A2A1A] rounded-[8px] px-3 py-2">Allergy protocol: {table.allergies.join(', ')}</p>}
      <p className="text-[13px] leading-snug text-console-300">{table.notes}</p>
      <div className="flex flex-col gap-2 mt-1">
        {table.status === 'LATE_NO_SHOW' && <Button variant="accent" onClick={() => onRelease(table)}>Release and re-seat T{table.tableNumber}</Button>}
        {next && <Button variant="dark" onClick={() => onAdvance(table.id, next)}>Advance to {COURSE_STAGES[next].label}</Button>}
        <Button variant="outline" onClick={() => onSlip(table)}>Generate kitchen slip</Button>
      </div>
    </aside>
  );
}
