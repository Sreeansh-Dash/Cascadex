/**
 * Shared Drug types used across mobile app and API responses.
 */

export interface Drug {
  drugbank_id: string;
  name: string;
  brand_names?: string[];
  class: string;
  half_life?: string;
  bioavailability?: string;
  molecular_weight?: number;
  description?: string;
}

export interface DrugSearchResult {
  drugbank_id: string;
  name: string;
  class: string;
}
