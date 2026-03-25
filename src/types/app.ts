// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
export type GeoLocation = { lat: number; long: number; info?: string };

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

export const APP_IDS = {
  RAEUME: '698f133d8617092fb0ba101c',
  DOZENTEN: '698f1344b2f96ffd533fd861',
  ANMELDUNGEN: '698f134539995ecb193f525c',
  KURSE: '698f134492fcb1ed5433f800',
  TEILNEHMER: '698f134577641afcf6ad489b',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {};

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'raeume': {
    'raumname': 'string/text',
    'gebaeude': 'string/text',
    'kapazitaet': 'number',
  },
  'dozenten': {
    'dozent_firstname': 'string/text',
    'dozent_lastname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'fachgebiet': 'string/text',
  },
  'anmeldungen': {
    'teilnehmer': 'applookup/select',
    'kurs': 'applookup/select',
    'anmeldedatum': 'date/date',
    'bezahlt': 'bool',
  },
  'kurse': {
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'startdatum': 'date/date',
    'enddatum': 'date/date',
    'max_teilnehmer': 'number',
    'preis': 'number',
    'raum': 'applookup/select',
    'dozent': 'applookup/select',
  },
  'teilnehmer': {
    'teilnehmer_firstname': 'string/text',
    'teilnehmer_lastname': 'string/text',
    'email': 'string/email',
    'telefon': 'string/tel',
    'geburtsdatum': 'date/date',
  },
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateRaeume = StripLookup<Raeume['fields']>;
export type CreateDozenten = StripLookup<Dozenten['fields']>;
export type CreateAnmeldungen = StripLookup<Anmeldungen['fields']>;
export type CreateKurse = StripLookup<Kurse['fields']>;
export type CreateTeilnehmer = StripLookup<Teilnehmer['fields']>;