import { useState, useMemo } from 'react';

export function useDebouncedFilter(tables, waitlist) {
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, LATE_RISK, FINISHING, SEATED
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      // Zone match
      if (zoneFilter !== 'ALL' && table.zone !== zoneFilter) {
        return false;
      }

      // Status match
      if (statusFilter === 'LATE_RISK' && table.status !== 'LATE_NO_SHOW' && !table.triageRequired) {
        return false;
      }
      if (statusFilter === 'FINISHING' && table.status !== 'FINISHING' && table.currentCourse !== 'CHECK_DROPPED') {
        return false;
      }
      if (statusFilter === 'SEATED' && (table.status !== 'SEATED' || table.status === 'LATE_NO_SHOW')) {
        return false;
      }

      // Search match
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = table.partyName && table.partyName.toLowerCase().includes(q);
        const matchesTableNum = table.tableNumber.toString().includes(q);
        const matchesServer = table.server && table.server.toLowerCase().includes(q);
        const matchesAllergy = table.allergies && table.allergies.some(a => a.toLowerCase().includes(q));
        if (!matchesName && !matchesTableNum && !matchesServer && !matchesAllergy) {
          return false;
        }
      }

      return true;
    });
  }, [tables, zoneFilter, statusFilter, searchQuery]);

  return {
    zoneFilter,
    setZoneFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredTables
  };
}
