import { Medication, PatientGraph, PatientAlert } from '@/api/patient.api';

export interface MockDrugInfo {
  drugbank_id: string;
  name: string;
  class: string;
  typicalDose: string;
  typicalFrequency: string;
  typicalIndication: string;
  enzymes: string[];
  metabolites: string[];
  receptors: string[];
  connections: { target: string; type: string; strength?: string }[];
}

export const MOCK_DRUGS_DB: Record<string, MockDrugInfo> = {
  'aspirin': {
    drugbank_id: 'DB00945',
    name: 'Aspirin',
    class: 'NSAID / Antiplatelet',
    typicalDose: '100mg',
    typicalFrequency: 'Once daily',
    typicalIndication: 'Cardioprotection',
    enzymes: ['CYP2C9'],
    metabolites: ['Salicylic Acid'],
    receptors: ['COX-1'],
    connections: [
      { target: 'CYP2C9', type: 'INHIBITS', strength: 'weak' },
      { target: 'Salicylic Acid', type: 'PRODUCES' },
      { target: 'COX-1', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'warfarin': {
    drugbank_id: 'DB00682',
    name: 'Warfarin',
    class: 'Anticoagulant',
    typicalDose: '5mg',
    typicalFrequency: 'Once daily',
    typicalIndication: 'Deep Vein Thrombosis',
    enzymes: ['CYP2C9'],
    metabolites: ['7-hydroxywarfarin'],
    receptors: ['VKORC1'],
    connections: [
      { target: 'CYP2C9', type: 'SUBSTRATE_OF' },
      { target: '7-hydroxywarfarin', type: 'PRODUCES' },
      { target: 'VKORC1', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'lisinopril': {
    drugbank_id: 'DB00722',
    name: 'Lisinopril',
    class: 'ACE Inhibitor',
    typicalDose: '10mg',
    typicalFrequency: 'Once daily',
    typicalIndication: 'Hypertension',
    enzymes: ['CYP2D6'],
    metabolites: ['Lisinopril-active'],
    receptors: ['ACE'],
    connections: [
      { target: 'CYP2D6', type: 'SUBSTRATE_OF' },
      { target: 'Lisinopril-active', type: 'PRODUCES' },
      { target: 'ACE', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'ibuprofen': {
    drugbank_id: 'DB01050',
    name: 'Ibuprofen',
    class: 'NSAID / Analgesic',
    typicalDose: '400mg',
    typicalFrequency: 'As needed',
    typicalIndication: 'Pain relief',
    enzymes: ['CYP2C9', 'CYP2D6'],
    metabolites: ['Ibuprofen-glucuronide'],
    receptors: ['COX-2'],
    connections: [
      { target: 'CYP2C9', type: 'SUBSTRATE_OF' },
      { target: 'CYP2D6', type: 'INHIBITS', strength: 'moderate' },
      { target: 'Ibuprofen-glucuronide', type: 'PRODUCES' },
      { target: 'COX-2', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'metformin': {
    drugbank_id: 'DB00331',
    name: 'Metformin',
    class: 'Biguanide Antidiabetic',
    typicalDose: '500mg',
    typicalFrequency: 'Twice daily',
    typicalIndication: 'Type 2 Diabetes',
    enzymes: ['OCT1'],
    metabolites: ['Metformin-unchanged'],
    receptors: ['AMPK'],
    connections: [
      { target: 'OCT1', type: 'SUBSTRATE_OF' },
      { target: 'Metformin-unchanged', type: 'PRODUCES' },
      { target: 'AMPK', type: 'ACTIVATES', strength: 'strong' }
    ]
  },
  'paracetamol': {
    drugbank_id: 'DB00316',
    name: 'Paracetamol',
    class: 'Analgesic / Antipyretic',
    typicalDose: '500mg',
    typicalFrequency: 'Every 6 hours',
    typicalIndication: 'Fever & Pain',
    enzymes: ['CYP2E1'],
    metabolites: ['NAPQI'],
    receptors: ['TRPV1'],
    connections: [
      { target: 'CYP2E1', type: 'SUBSTRATE_OF' },
      { target: 'NAPQI', type: 'PRODUCES' },
      { target: 'TRPV1', type: 'ACTIVATES', strength: 'weak' }
    ]
  },
  'penicillin': {
    drugbank_id: 'DB01053',
    name: 'Penicillin',
    class: 'Beta-lactam Antibiotic',
    typicalDose: '250mg',
    typicalFrequency: 'Four times daily',
    typicalIndication: 'Bacterial Infection',
    enzymes: ['OAT1'],
    metabolites: ['Penicilloic Acid'],
    receptors: ['PBP'],
    connections: [
      { target: 'OAT1', type: 'SUBSTRATE_OF' },
      { target: 'Penicilloic Acid', type: 'PRODUCES' },
      { target: 'PBP', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'clopidogrel': {
    drugbank_id: 'DB00758',
    name: 'Clopidogrel',
    class: 'Antiplatelet',
    typicalDose: '75mg',
    typicalFrequency: 'Once daily',
    typicalIndication: 'Atherosclerosis prevention',
    enzymes: ['CYP2C19'],
    metabolites: ['Clopidogrel-Active-Thiol'],
    receptors: ['P2Y12'],
    connections: [
      { target: 'CYP2C19', type: 'SUBSTRATE_OF' },
      { target: 'Clopidogrel-Active-Thiol', type: 'PRODUCES' },
      { target: 'P2Y12', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'omeprazole': {
    drugbank_id: 'DB00338',
    name: 'Omeprazole',
    class: 'Proton Pump Inhibitor',
    typicalDose: '20mg',
    typicalFrequency: 'Once daily (morning)',
    typicalIndication: 'GERD / Acid Reflux',
    enzymes: ['CYP2C19'],
    metabolites: ['5-hydroxyomeprazole'],
    receptors: ['H+/K+-ATPase'],
    connections: [
      { target: 'CYP2C19', type: 'INHIBITS', strength: 'strong' },
      { target: '5-hydroxyomeprazole', type: 'PRODUCES' },
      { target: 'H+/K+-ATPase', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'simvastatin': {
    drugbank_id: 'DB00641',
    name: 'Simvastatin',
    class: 'HMG-CoA Reductase Inhibitor',
    typicalDose: '20mg',
    typicalFrequency: 'Once daily (evening)',
    typicalIndication: 'Hypercholesterolemia',
    enzymes: ['CYP3A4'],
    metabolites: ['Simvastatin acid'],
    receptors: ['HMG-CoA-Reductase'],
    connections: [
      { target: 'CYP3A4', type: 'SUBSTRATE_OF' },
      { target: 'Simvastatin acid', type: 'PRODUCES' },
      { target: 'HMG-CoA-Reductase', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'amlodipine': {
    drugbank_id: 'DB00381',
    name: 'Amlodipine',
    class: 'Calcium Channel Blocker',
    typicalDose: '5mg',
    typicalFrequency: 'Once daily',
    typicalIndication: 'Hypertension / Angina',
    enzymes: ['CYP3A4'],
    metabolites: ['Dehydroamlodipine'],
    receptors: ['L-type-Calcium-Channel'],
    connections: [
      { target: 'CYP3A4', type: 'INHIBITS', strength: 'moderate' },
      { target: 'Dehydroamlodipine', type: 'PRODUCES' },
      { target: 'L-type-Calcium-Channel', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'sildenafil': {
    drugbank_id: 'DB00203',
    name: 'Sildenafil',
    class: 'PDE5 Inhibitor',
    typicalDose: '50mg',
    typicalFrequency: 'As needed',
    typicalIndication: 'Erectile Dysfunction',
    enzymes: ['CYP3A4'],
    metabolites: ['Desmethylsildenafil'],
    receptors: ['PDE5'],
    connections: [
      { target: 'CYP3A4', type: 'SUBSTRATE_OF' },
      { target: 'Desmethylsildenafil', type: 'PRODUCES' },
      { target: 'PDE5', type: 'INHIBITS', strength: 'strong' }
    ]
  },
  'nitroglycerin': {
    drugbank_id: 'DB01110',
    name: 'Nitroglycerin',
    class: 'Vasodilator / Nitrate',
    typicalDose: '0.4mg',
    typicalFrequency: 'As needed',
    typicalIndication: 'Acute Angina',
    enzymes: ['ALDH2'],
    metabolites: ['1,2-Glyceryl Dinitrate', 'Nitric Oxide'],
    receptors: ['Guanylyl-Cyclase'],
    connections: [
      { target: 'ALDH2', type: 'SUBSTRATE_OF' },
      { target: 'Nitric Oxide', type: 'PRODUCES' },
      { target: 'Guanylyl-Cyclase', type: 'ACTIVATES', strength: 'strong' }
    ]
  }
};

// Database of specific interactions
export interface InteractionRule {
  drug1: string; // key of MOCK_DRUGS_DB
  drug2: string; // key of MOCK_DRUGS_DB
  severity: 'critical' | 'moderate' | 'safe';
  mechanism: string;
  consequence: string;
}

export const MOCK_INTERACTION_RULES: InteractionRule[] = [
  {
    drug1: 'aspirin',
    drug2: 'warfarin',
    severity: 'critical',
    mechanism: 'Pharmacodynamic synergism & platelet inhibition via COX-1 & VKORC1 pathways.',
    consequence: 'Severe risk of major internal bleeding. Aspirin inhibits platelet aggregation while Warfarin prevents clotting factor synthesis.'
  },
  {
    drug1: 'lisinopril',
    drug2: 'ibuprofen',
    severity: 'moderate',
    mechanism: 'Antagonistic prostaglandin synthesis inhibition and renal efferent arteriole dilation.',
    consequence: 'Reduced blood pressure control and increased risk of acute kidney injury.'
  },
  {
    drug1: 'clopidogrel',
    drug2: 'omeprazole',
    severity: 'critical',
    mechanism: 'Strong CYP2C19 enzyme inhibition.',
    consequence: 'Omeprazole blocks CYP2C19, preventing the activation of Clopidogrel and increasing the risk of blood clots.'
  },
  {
    drug1: 'simvastatin',
    drug2: 'amlodipine',
    severity: 'moderate',
    mechanism: 'CYP3A4 substrate competition and mild inhibition.',
    consequence: 'Amlodipine increases Simvastatin systemic exposure, raising risk of statin-induced myopathy (muscle breakdown).'
  },
  {
    drug1: 'sildenafil',
    drug2: 'nitroglycerin',
    severity: 'critical',
    mechanism: 'cGMP accumulation due to PDE5 inhibition and nitric oxide donor activation.',
    consequence: 'Dangerous, life-threatening drop in blood pressure. Never use together.'
  }
];

// Helper to look up drug by generic/brand name
export function findDrugInDb(query: string): MockDrugInfo | null {
  const normQuery = query.toLowerCase().trim();
  
  // Try exact key match
  if (MOCK_DRUGS_DB[normQuery]) return MOCK_DRUGS_DB[normQuery];

  // Try matching by name or common brand name mappings
  for (const key of Object.keys(MOCK_DRUGS_DB)) {
    const drug = MOCK_DRUGS_DB[key];
    if (drug.name.toLowerCase() === normQuery) {
      return drug;
    }
  }

  // Common Indian brand mappings
  const brandMapping: Record<string, string> = {
    'ecosprin': 'aspirin',
    'dolo': 'paracetamol',
    'glycomet': 'metformin',
    'crocin': 'paracetamol',
    'calpol': 'paracetamol',
    'taxim': 'penicillin',
    'amox': 'penicillin'
  };

  const mappedKey = brandMapping[normQuery];
  if (mappedKey && MOCK_DRUGS_DB[mappedKey]) {
    return MOCK_DRUGS_DB[mappedKey];
  }

  return null;
}

// Generate Graph Nodes and Edges based on selected medications
export function generateGraphForMeds(meds: Medication[]): PatientGraph {
  const nodesMap = new Map<string, any>();
  const edges: any[] = [];

  // 1. Add patient node
  nodesMap.set('PATIENT', {
    id: 'PATIENT',
    label: 'Patient',
    type: 'receptor', // color matching
    effect: 'Regimen Center'
  });

  // 2. Add drug nodes
  meds.forEach((med) => {
    const dbDrug = findDrugInDb(med.name);
    const drugId = dbDrug ? dbDrug.drugbank_id : `DRUG_${med.name.toUpperCase()}`;
    const drugLabel = dbDrug ? dbDrug.name : med.name;
    const drugClass = dbDrug ? dbDrug.class : 'Medication';

    nodesMap.set(drugId, {
      id: drugId,
      label: drugLabel,
      type: 'drug',
      drug_class: drugClass
    });

    // Link patient to drug
    edges.push({
      source: 'PATIENT',
      target: drugId,
      type: 'TAKES',
      strength: 'safe'
    });

    if (dbDrug) {
      // Add related enzymes, metabolites, receptors
      dbDrug.connections.forEach((conn) => {
        let nodeType: 'enzyme' | 'metabolite' | 'receptor' = 'enzyme';
        if (dbDrug.enzymes.includes(conn.target)) nodeType = 'enzyme';
        else if (dbDrug.metabolites.includes(conn.target)) nodeType = 'metabolite';
        else if (dbDrug.receptors.includes(conn.target)) nodeType = 'receptor';

        // Add node if not exists
        if (!nodesMap.has(conn.target)) {
          nodesMap.set(conn.target, {
            id: conn.target,
            label: conn.target,
            type: nodeType,
            family: nodeType === 'enzyme' ? 'CYP450' : undefined,
            active: nodeType === 'metabolite' ? true : undefined,
            effect: nodeType === 'receptor' ? 'Biological target' : undefined
          });
        }

        // Link drug to target
        edges.push({
          source: drugId,
          target: conn.target,
          type: conn.type,
          strength: conn.strength || 'safe'
        });
      });
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges: edges
  };
}

// Generate active alerts for patient meds
export function generateAlertsForMeds(meds: Medication[]): PatientAlert[] {
  const alerts: PatientAlert[] = [];
  
  for (let i = 0; i < meds.length; i++) {
    for (let j = i + 1; j < meds.length; j++) {
      const name1 = meds[i].name.toLowerCase();
      const name2 = meds[j].name.toLowerCase();

      // Find matching rule
      const rule = MOCK_INTERACTION_RULES.find(
        (r) =>
          (r.drug1 === name1 && r.drug2 === name2) ||
          (r.drug1 === name2 && r.drug2 === name1)
      );

      if (rule) {
        const drug1Db = findDrugInDb(rule.drug1);
        const drug2Db = findDrugInDb(rule.drug2);
        
        // Find shared enzyme or connection
        const via = drug1Db?.enzymes.find(e => drug2Db?.enzymes.includes(e)) || 'Pharmacodynamic';

        alerts.push({
          chain_id: `alert_${rule.drug1}_${rule.drug2}`,
          perpetrator: drug1Db?.name || rule.drug1,
          victim: drug2Db?.name || rule.drug2,
          via_enzyme: via,
          severity: rule.severity,
          consequence: rule.consequence
        });
      }
    }
  }

  // Sort critical first
  const order: Record<string, number> = { critical: 0, moderate: 1, safe: 2 };
  alerts.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));

  return alerts;
}
