import type { Anmeldungen, Kurse } from './app';

export type EnrichedAnmeldungen = Anmeldungen & {
  teilnehmerName: string;
  kursName: string;
};

export type EnrichedKurse = Kurse & {
  raumName: string;
  dozentName: string;
};
