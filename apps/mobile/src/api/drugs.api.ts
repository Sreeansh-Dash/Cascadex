/**
 * Drug API endpoints.
 * Maps to FastAPI /api/drugs/* router.
 */
import api from './client';

export interface Drug {
  drugbank_id: string;
  name: string;
  brand_names?: string[];
  class?: string;
  half_life?: string;
  bioavailability?: string;
  molecular_weight?: number;
  description?: string;
}

/** Search for a drug by name */
export const lookupDrug = async (name: string): Promise<Drug[]> => {
  const { data } = await api.get('/drugs/lookup', { params: { name } });
  return data;
};

/** Get full drug details by DrugBank ID */
export const getDrugById = async (drugbankId: string): Promise<Drug> => {
  const { data } = await api.get(`/drugs/${drugbankId}`);
  return data;
};

/** Lookup drug by NDC barcode */
export const lookupBarcode = async (ndc: string): Promise<Drug> => {
  const { data } = await api.get(`/drugs/barcode/${ndc}`);
  return data;
};
