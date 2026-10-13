import React, { useState, useMemo } from 'react';
import { useAppStore } from './hooks/useAppStore.js';
import { useDebouncedFilter } from './hooks/useDebouncedFilter.js';
import { TopNav, FilterToolbar } from './components/navigation/Navigation.jsx';
import { MetricsStrip, FloorPlanMap, LedgerTable, TableDetail } from './components/floor/Floor.jsx';
import { TableReleaseModal, ExpediterSlipModal, WaitlistDrawer, ShiftLogDrawer } from './components/triage/Triage.jsx';
import { ToastStack, Button } from './components/common/Primitives.jsx';
import { buildKitchenSlipText } from './utils/slipFormatter.js';

export default function App() {
  const { state, toasts, removeToast, releaseAndReassignTable, recordSlipCopied, updateTableCourse, resetFridayShift, addWaitlistGuest } = useAppStore();
  const { zoneFilter, setZoneFilter, statusFilter, setStatusFilter, searchQuery, setSearchQuery, filteredTables } = useDebouncedFilter(state.tables, state.waitlist);

  const [selectedId, setSelectedId] = useState('T-14');
  const [releaseTable, setReleaseTable] = useState(null);
  const [activeSlip, setActiveSlip] = useState(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [logTab, setLogTab] = useState('log');
  const [confirmReset, setConfirmReset] = useState(false);

  const waitingCount = state.waitlist.filter((w) => w.status === 'WAITING').length;
  const selectedTable = useMemo(() => state.tables.find((t) => t.id === selectedId) || filteredTables[0] || state.tables[0], [state.tables, selectedId, filteredTables]);

  const handleConfirmRelease = (tableId, waitlistId, allergies, note) => {
    releaseAndReassignTable(tableId, waitlistId, allergies, note);
    setReleaseTable(null);
    setSelectedId(tableId);
    setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('maitre_os_service_state_v1'));
        if (saved?.expediterSlips?.[0]) setActiveSlip(saved.expediterSlips[0]);
      } catch (_) {}
    }, 120);
  };

  const handleKitchenSlip = (table) => {
    const existing = state.expediterSlips.find((s) => s.tableNumber === table.tableNumber);
    if (existing) { setActiveSlip(existing); return; }
    setActiveSlip({
      id: `PREVIEW-T${table.tableNumber}`,
      slipCode: `PREVIEW-T${table.tableNumber}`,
      tableNumber: table.tableNumber,
      partyName: table.partyName,
      partySize: table.partySize,
      timestamp: state.meta.currentTime,
      allergies: table.allergies || [],
      formattedTicket: buildKitchenSlipText({
        tableNumber: table.tableNumber, partyName: table.partyName || 'Open hold', partySize: table.partySize,
        server: table.server, allergies: table.allergies || [], notes: table.notes || 'Standard service flow', time: state.meta.currentTime + ':00',
      }),
    });
  };

  const handleCopySlip = async (slip) => {
    try { await navigator.clipboard.writeText(slip.formattedTicket); } catch (_) {
      const ta = document.createElement('textarea'); ta.value = slip.formattedTicket; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {} document.body.removeChild(ta);
    }
    if (!String(slip.id).startsWith('PREVIEW')) recordSlipCopied(slip.id);
  };

  const handleQuickSeat = (guest) => {
    const open = state.tables.filter((t) => (t.status === 'LATE_NO_SHOW') && t.capacity >= guest.partySize).sort((a, b) => a.capacity - b.capacity)[0]
      || state.tables.find((t) => t.status === 'LATE_NO_SHOW');
    setWaitlistOpen(false);
    if (open) { setSelectedId(open.id); setReleaseTable(open); }
  };

  return (
    <div className="min-h-screen bg-console-950 text-console-50 font-sans">
      <TopNav meta={state.meta} tables={state.tables} waitingCount={waitingCount}
        onReset={() => setConfirmReset(true)}
        onOpenWaitlist={() => setWaitlistOpen(true)}
        onOpenLog={() => { setLogTab('log'); setLogOpen(true); }}
        onOpenSlips={() => { setLogTab('slips'); setLogOpen(true); }} />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        {/* Command strip: replaces hero card with ops console instruction rail */}
        <section aria-label="Service directive" className="bg-console-900 border border-console-700 rounded-[12px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-bistro-brass">Directive : Rescue T14 : Seat Vance 4-top : Fire allergy slip</p>
            <div className="flex flex-wrap items-baseline gap-x-3 mt-1">
              <h2 className="font-serif text-[22px] sm:text-[26px] font-bold leading-tight">Friday pass, 20:25. One late hold blocks yield.</h2>
              <p className="font-mono text-[12px] text-console-400">3 steps : filter Late : release : copy slip</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="accent" onClick={() => { setStatusFilter('LATE_RISK'); setSelectedId('T-14'); document.getElementById('ops-grid')?.scrollIntoView({ behavior: 'smooth' }); }}>Isolate Table 14</Button>
            <Button variant="dark" onClick={() => setWaitlistOpen(true)}>Bar queue</Button>
          </div>
        </section>

        <MetricsStrip tables={state.tables} waitlist={state.waitlist} />
        <FilterToolbar zoneFilter={zoneFilter} setZoneFilter={setZoneFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} resultCount={filteredTables.length} />

        <div id="ops-grid" className="grid xl:grid-cols-[1fr_340px] gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <FloorPlanMap tables={filteredTables} selectedId={selectedId} onSelect={setSelectedId} />
            <LedgerTable tables={filteredTables} selectedId={selectedId} onSelect={setSelectedId} />
            {filteredTables.length === 0 && (
              <div className="bg-console-900 border border-console-700 rounded-[12px] p-8 text-center">
                <p className="font-serif text-[18px] font-semibold">No covers match.</p>
                <Button variant="primary" onClick={() => { setZoneFilter('ALL'); setStatusFilter('ALL'); setSearchQuery(''); }} className="mt-4">Clear filters</Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 xl:sticky xl:top-[76px]">
            <TableDetail table={selectedTable} onRelease={setReleaseTable} onSlip={handleKitchenSlip} onAdvance={updateTableCourse} />
            <section aria-label="Queue preview" className="bg-console-900 border border-console-700 rounded-[12px] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-console-400">Bar queue : {waitingCount}</h3>
                <button onClick={() => setWaitlistOpen(true)} className="tactile-button text-[12px] font-bold text-bistro-brass hover:underline focus-visible:ring-2 focus-visible:ring-bistro-brass rounded">Open full queue</button>
              </div>
              {state.waitlist.filter((w) => w.status === 'WAITING').slice(0, 3).map((w) => (
                <div key={w.id} className="py-2 border-t border-console-700 first:border-t-0 flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="text-[13px] font-bold truncate">{w.guestName}</p><p className="font-mono text-[11px] text-console-400">{w.partySize}-top : {w.elapsedWaitMins}m : {w.allergies?.[0] || 'No allergy'}</p></div>
                  <button onClick={() => handleQuickSeat(w)} className="tactile-button shrink-0 text-[12px] font-bold border border-console-600 hover:border-bistro-brass hover:text-bistro-brass rounded-[7px] px-2.5 py-1.5">Seat</button>
                </div>
              ))}
            </section>
          </div>
        </div>

        <footer className="border-t border-console-700 pt-4 pb-8 flex flex-col sm:flex-row gap-2 justify-between text-[12px] text-console-400">
          <p className="font-mono uppercase tracking-widest text-[11px]">GM Søren Lind : Maître d Astrid Møller : Pass Nikolaj Brøgger</p>
          <p>localStorage <span className="font-mono font-bold text-console-300">maitre_os_service_state_v1</span> : zero network calls</p>
        </footer>
      </main>

      <TableReleaseModal open={!!releaseTable} table={releaseTable} waitlist={state.waitlist} onClose={() => setReleaseTable(null)} onConfirm={handleConfirmRelease} />
      <ExpediterSlipModal open={!!activeSlip} slip={activeSlip} onClose={() => setActiveSlip(null)} onCopy={(id) => { if (!String(id).startsWith('PREVIEW')) recordSlipCopied(id); }} />
      <WaitlistDrawer open={waitlistOpen} onClose={() => setWaitlistOpen(false)} waitlist={state.waitlist} onSeat={handleQuickSeat} onAdd={addWaitlistGuest} />
      <ShiftLogDrawer open={logOpen} onClose={() => setLogOpen(false)} logs={state.serviceLog} slips={state.expediterSlips} onCopySlip={handleCopySlip} onViewSlip={(s) => { setLogOpen(false); setActiveSlip(s); }} initialTab={logTab} />

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="alertdialog" aria-modal="true" aria-label="Confirm shift reset">
          <button aria-label="Cancel reset" onClick={() => setConfirmReset(false)} className="absolute inset-0 bg-black/70 cursor-pointer" />
          <div className="relative bg-console-900 border border-console-600 rounded-[12px] max-w-md w-full p-6">
            <h2 className="font-serif text-[19px] font-bold">Reset Friday dinner shift?</h2>
            <p className="text-[13px] text-console-300 mt-2">Restores Table 14 to 25m late risk and returns Vance party to the bar. Current triage edits are discarded.</p>
            <div className="flex gap-2 mt-5">
              <Button variant="dark" onClick={() => setConfirmReset(false)} className="flex-1">Keep floor</Button>
              <Button variant="primary" onClick={() => { resetFridayShift(); setSelectedId('T-14'); setConfirmReset(false); }} className="flex-1">Reset shift</Button>
            </div>
          </div>
        </div>
      )}
      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
