// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Raeume {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    raumname?: string;
    gebaeude?: string;
    kapazitaet?: number;
  };
}

export interface Dozenten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    dozent_firstname?: string;
    dozent_lastname?: string;
    email?: string;
    telefon?: string;
    fachgebiet?: string;
  };
}

export interface Kurse {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    max_teilnehmer?: number;
    preis?: number;
    raum?: string; // applookup -> URL zu 'Raeume' Record
    dozent?: string; // applookup -> URL zu 'Dozenten' Record
  };
}

export interface Teilnehmer {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer_firstname?: string;
    teilnehmer_lastname?: string;
    email?: string;
    telefon?: string;
    geburtsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Anmeldungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    teilnehmer?: string; // applookup -> URL zu 'Teilnehmer' Record
    kurs?: string; // applookup -> URL zu 'Kurse' Record
    anmeldedatum?: string; // Format: YYYY-MM-DD oder ISO String
    bezahlt?: boolean;
  };
}

export const APP_IDS = {
  RAEUME: '698f133d8617092fb0ba101c',
  DOZENTEN: '698f1344b2f96ffd533fd861',
  KURSE: '698f134492fcb1ed5433f800',
  TEILNEHMER: '698f134577641afcf6ad489b',
  ANMELDUNGEN: '698f134539995ecb193f525c',
} as const;

// Helper Types for creating new records
export type CreateRaeume = Raeume['fields'];
export type CreateDozenten = Dozenten['fields'];
export type CreateKurse = Kurse['fields'];
export type CreateTeilnehmer = Teilnehmer['fields'];
export type CreateAnmeldungen = Anmeldungen['fields'];