import React from 'react';
import { Button, Badge } from '../common/Primitives.jsx';
import { formatCurrency } from '../../utils/currency.js';

const ZONES = [
  { id: 'ALL', label: 'Full floor' },
  { id: 'MDR', label: 'Main dining' },
  { id: 'CHEF_COUNTER', label: "Chef's counter" },
  { id: 'PATIO', label: 'Patio' },
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'LATE_RISK', label: 'Late / No-show' },
  { id: 'FINISHING', label: 'Check dropped' },
  { id: 'SEATED', label: 'Seated' },
];

export function TopNav({ meta, tables, waitingCount, onReset, onOpenWaitlist, onOpenLog, onOpenSlips }) {
  const atRisk = tables.filter((t) => t.triageRequired || t.status === 'LATE_NO_SHOW');
  const atRiskValue = atRisk.reduce((s, t) => s + (t.estimatedFinalSpend || 0), 0);
  return (
    <header className="bg-console-950 border-b border-console-700 sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[8px] bg-bistro-brass text-console-950 flex items-center justify-center font-serif font-bold text-[19px] shrink-0">M</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-[20px] font-bold leading-none text-console-50">MAÎTRE-OS</h1>
                <span className="hidden sm:inline font-mono text-[10px] font-bold uppercase tracking-widest text-bistro-brass border border-[#5A4A22] bg-[#221C0E] rounded-[5px] px-1.5 py-0.5">Live</span>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-console-400 mt-1">{meta.shiftName} : {meta.currentTime} : {meta.serviceDate}</p>
            </div>
          </div>
          <p className="hidden xl:block font-mono text-[12px] text-console-300">
            {atRisk.length ? <span className="text-bistro-terracotta font-bold">TRIAGE {atRisk.map((t) => 'T' + t.tableNumber).join(' + ')} : {formatCurrency(atRiskValue)} HELD</span> : <span>Floor nominal. All covers turning.</span>}
            <span className="text-console-400"> : GM {meta.activeStaff.generalManager} : Pass {meta.activeStaff.headChef}</span>
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="dark" size="sm" onClick={onOpenWaitlist}>Bar queue ({waitingCount})</Button>
            <Button variant="dark" size="sm" onClick={onOpenSlips}>Slips</Button>
            <Button variant="dark" size="sm" onClick={onOpenLog}>Log</Button>
            <Button variant="outline" size="sm" onClick={onReset}>Reset Friday shift</Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function FilterToolbar({ zoneFilter, setZoneFilter, statusFilter, setStatusFilter, searchQuery, setSearchQuery, resultCount }) {
  return (
    <div className="bg-console-900 border border-console-700 rounded-[12px] p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by zone">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-console-400 w-14">Zone</span>
          {ZONES.map((z) => (
            <button key={z.id} onClick={() => setZoneFilter(z.id)} aria-pressed={zoneFilter === z.id}
              className={`tactile-button rounded-[7px] border px-3 py-1.5 text-[12px] font-bold focus-visible:ring-2 focus-visible:ring-bistro-brass ${zoneFilter === z.id ? 'bg-bistro-brass text-console-950 border-bistro-brass' : 'bg-console-800 text-console-300 border-console-600 hover:border-bistro-brass hover:text-console-50'}`}>
              {z.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-console-400 w-14">Status</span>
          {STATUS_FILTERS.map((s) => (
            <button key={s.id} onClick={() => setStatusFilter(s.id)} aria-pressed={statusFilter === s.id}
              className={`tactile-button rounded-[7px] border px-3 py-1.5 text-[12px] font-bold focus-visible:ring-2 focus-visible:ring-bistro-brass ${statusFilter === s.id ? 'bg-bistro-terracotta text-white border-bistro-terracotta' : 'bg-console-800 text-console-300 border-console-600 hover:border-bistro-terracotta hover:text-console-50'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="lg:ml-auto w-full lg:w-[300px]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-console-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input id="floor-search" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${resultCount} tables: party, no., allergy`}
              className="w-full rounded-[8px] border border-console-600 bg-console-950 pl-9 pr-8 py-2 text-[13px] font-medium text-console-50 placeholder:text-console-400 focus:outline-none focus:ring-2 focus:ring-bistro-brass focus:border-bistro-brass" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-[6px] hover:bg-console-800 flex items-center justify-center text-console-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
