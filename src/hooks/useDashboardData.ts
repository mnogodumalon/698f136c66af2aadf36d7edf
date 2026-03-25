import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Raeume, Dozenten, Anmeldungen, Kurse, Teilnehmer } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [raeumeData, dozentenData, anmeldungenData, kurseData, teilnehmerData] = await Promise.all([
        LivingAppsService.getRaeume(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getKurse(),
        LivingAppsService.getTeilnehmer(),
      ]);
      setRaeume(raeumeData);
      setDozenten(dozentenData);
      setAnmeldungen(anmeldungenData);
      setKurse(kurseData);
      setTeilnehmer(teilnehmerData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [raeumeData, dozentenData, anmeldungenData, kurseData, teilnehmerData] = await Promise.all([
          LivingAppsService.getRaeume(),
          LivingAppsService.getDozenten(),
          LivingAppsService.getAnmeldungen(),
          LivingAppsService.getKurse(),
          LivingAppsService.getTeilnehmer(),
        ]);
        setRaeume(raeumeData);
        setDozenten(dozentenData);
        setAnmeldungen(anmeldungenData);
        setKurse(kurseData);
        setTeilnehmer(teilnehmerData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const raeumeMap = useMemo(() => {
    const m = new Map<string, Raeume>();
    raeume.forEach(r => m.set(r.record_id, r));
    return m;
  }, [raeume]);

  const dozentenMap = useMemo(() => {
    const m = new Map<string, Dozenten>();
    dozenten.forEach(r => m.set(r.record_id, r));
    return m;
  }, [dozenten]);

  const kurseMap = useMemo(() => {
    const m = new Map<string, Kurse>();
    kurse.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kurse]);

  const teilnehmerMap = useMemo(() => {
    const m = new Map<string, Teilnehmer>();
    teilnehmer.forEach(r => m.set(r.record_id, r));
    return m;
  }, [teilnehmer]);

  return { raeume, setRaeume, dozenten, setDozenten, anmeldungen, setAnmeldungen, kurse, setKurse, teilnehmer, setTeilnehmer, loading, error, fetchAll, raeumeMap, dozentenMap, kurseMap, teilnehmerMap };
}