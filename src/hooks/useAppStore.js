import { useState, useEffect, useCallback } from 'react';
import { INITIAL_SHIFT_STATE } from '../data/mockData';
import { buildKitchenSlipText } from '../utils/slipFormatter';

const STORAGE_KEY = 'maitre_os_service_state_v1';

export function useAppStore() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse localStorage shift state:", e);
    }
    return INITIAL_SHIFT_STATE;
  });

  const [toasts, setToasts] = useState([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }
  }, [state]);

  const addToast = useCallback((title, message, tone = 'default') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 1. Core Workflow: Release Late Table & Seat Waitlist VIP Party
  const releaseAndReassignTable = useCallback((tableId, waitlistId, customAllergies = null, note = '') => {
    setState((prev) => {
      const table = prev.tables.find((t) => t.id === tableId);
      const guest = prev.waitlist.find((w) => w.id === waitlistId);

      if (!table || !guest) return prev;

      const updatedAllergies = customAllergies !== null ? customAllergies : guest.allergies;
      const formattedTimestamp = new Date().toTimeString().split(' ')[0];

      // Formatted slip
      const slipTicket = buildKitchenSlipText({
        tableNumber: table.tableNumber,
        partyName: guest.guestName,
        partySize: guest.partySize,
        server: table.server || "Astrid Møller",
        allergies: updatedAllergies,
        notes: note || guest.notes || "VIP Re-assigned floor triage priority.",
        time: formattedTimestamp
      });

      const newSlip = {
        id: `SLIP-${Date.now()}`,
        slipCode: `SLIP-T${table.tableNumber}-${Date.now().toString().slice(-4)}`,
        tableNumber: table.tableNumber,
        partyName: guest.guestName,
        partySize: guest.partySize,
        timestamp: formattedTimestamp,
        allergies: updatedAllergies,
        formattedTicket: slipTicket,
        copiedAt: null
      };

      const updatedTables = prev.tables.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: "SEATED",
            partyName: guest.guestName,
            partySize: guest.partySize,
            seatedTime: "20:25",
            currentCourse: "WATER_MENUS",
            turnDurationMins: 0,
            expectedDurationMins: 110,
            spendToDate: 45, // First drinks transferred from bar tab
            estimatedFinalSpend: guest.estimatedSpend || 600,
            allergies: updatedAllergies,
            vipStatus: true,
            triageRequired: false,
            notes: `Seated from Bar Waitlist (waited ${guest.elapsedWaitMins}m). ${note || guest.notes}`
          };
        }
        return t;
      });

      const updatedWaitlist = prev.waitlist.map((w) => {
        if (w.id === waitlistId) {
          return {
            ...w,
            status: "SEATED",
            seatedTableId: tableId
          };
        }
        return w;
      });

      const newLogs = [
        {
          id: `LOG-${Date.now()}-1`,
          timestamp: formattedTimestamp,
          action: "TABLE_RELEASED",
          tableNumber: table.tableNumber,
          partyName: table.partyName || "Unverified Late Party",
          details: `Table #${table.tableNumber} cancelled & forfeited due to 25m grace lapse. Rescued $450 yield.`,
          actor: "Astrid Møller (Maître d')"
        },
        {
          id: `LOG-${Date.now()}-2`,
          timestamp: formattedTimestamp,
          action: "PARTY_SEATED",
          tableNumber: table.tableNumber,
          partyName: guest.guestName,
          details: `VIP party seated at Table #${table.tableNumber}. Transferred bar tab to table. Dietary slip queued for kitchen.`,
          actor: "Astrid Møller (Maître d')"
        },
        ...prev.serviceLog
      ];

      return {
        ...prev,
        tables: updatedTables,
        waitlist: updatedWaitlist,
        serviceLog: newLogs,
        expediterSlips: [newSlip, ...prev.expediterSlips]
      };
    });

    addToast(
      "Table Re-Assigned & VIP Seated",
      `Table #${tableId.replace('T-', '')} successfully assigned. Dietary slip generated for kitchen pass.`,
      "success"
    );
  }, [addToast]);

  // 2. Mark Kitchen Slip as Copied
  const recordSlipCopied = useCallback((slipId) => {
    setState((prev) => ({
      ...prev,
      expediterSlips: prev.expediterSlips.map((s) =>
        s.id === slipId ? { ...s, copiedAt: new Date().toTimeString().split(' ')[0] } : s
      )
    }));
    addToast("Copied to Clipboard", "Dietary alert slip copied. Ready to dispatch to Head Chef Nikolaj.", "info");
  }, [addToast]);

  // 3. Update Table Course Progression
  const updateTableCourse = useCallback((tableId, nextCourse) => {
    setState((prev) => {
      const table = prev.tables.find((t) => t.id === tableId);
      if (!table) return prev;

      const updatedTables = prev.tables.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            currentCourse: nextCourse,
            status: nextCourse === 'CHECK_DROPPED' ? 'FINISHING' : t.status
          };
        }
        return t;
      });

      const newLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        action: "STATUS_UPDATE",
        tableNumber: table.tableNumber,
        partyName: table.partyName,
        details: `Course progressed to ${nextCourse.replace('_', ' ')}.`,
        actor: "Service Station"
      };

      return {
        ...prev,
        tables: updatedTables,
        serviceLog: [newLog, ...prev.serviceLog]
      };
    });
    addToast("Course Stage Updated", `Table updated to new course.`, "info");
  }, [addToast]);

  // 4. Reset Entire Shift to Friday Dinner Seed
  const resetFridayShift = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      ...INITIAL_SHIFT_STATE,
      meta: {
        ...INITIAL_SHIFT_STATE.meta,
        lastResetAt: new Date().toISOString()
      }
    });
    addToast("Shift Reset to Friday Dinner", "All table states, waitlist entries, and triage queues restored to default.", "info");
  }, [addToast]);

  // 5. Add Walk-In or Bar Waitlist
  const addWaitlistGuest = useCallback((guest) => {
    const newGuest = {
      id: `W-${Date.now().toString().slice(-4)}`,
      guestName: guest.guestName,
      partySize: Number(guest.partySize) || 2,
      quotedWaitMins: Number(guest.quotedWaitMins) || 20,
      elapsedWaitMins: 0,
      location: guest.location || "BAR_HIGH_TOP",
      vipTier: guest.vipTier || "STANDARD",
      allergies: guest.allergies || [],
      phone: guest.phone || "",
      estimatedSpend: Number(guest.estimatedSpend) || 300,
      seatedTableId: null,
      status: "WAITING",
      notes: guest.notes || ""
    };

    setState((prev) => ({
      ...prev,
      waitlist: [newGuest, ...prev.waitlist],
      serviceLog: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          action: "STATUS_UPDATE",
          tableNumber: 0,
          partyName: newGuest.guestName,
          details: `Added to bar queue (${newGuest.partySize}-top). Quoted ${newGuest.quotedWaitMins}m.`,
          actor: "Astrid Møller"
        },
        ...prev.serviceLog
      ]
    }));
    addToast("Added to Waitlist", `${newGuest.guestName} added to bar waiting queue.`, "info");
  }, [addToast]);

  return {
    state,
    toasts,
    removeToast,
    releaseAndReassignTable,
    recordSlipCopied,
    updateTableCourse,
    resetFridayShift,
    addWaitlistGuest
  };
}
