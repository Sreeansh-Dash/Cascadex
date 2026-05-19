/**
 * Shared Patient types used across mobile app and API responses.
 */

export interface Patient {
  id: string;
  age_range?: string;
  weight_range?: string;
  created_at: string;
}

export interface Medication {
  drugbank_id: string;
  drug_name: string;
  dose: string;
  frequency: string;
  start_date: string;
  indication?: string;
}
