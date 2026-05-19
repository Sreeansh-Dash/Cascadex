// packages/graph/setup_indexes.cypher
// Run this BEFORE loading any data into Neo4j AuraDB.
// Execute in Neo4j Browser or via cypher-shell.

CREATE INDEX drug_name IF NOT EXISTS FOR (d:Drug) ON (d.name);
CREATE INDEX drug_id IF NOT EXISTS FOR (d:Drug) ON (d.drugbank_id);
CREATE INDEX enzyme_name IF NOT EXISTS FOR (e:Enzyme) ON (e.name);
CREATE INDEX metabolite_name IF NOT EXISTS FOR (m:Metabolite) ON (m.name);
CREATE INDEX receptor_name IF NOT EXISTS FOR (r:Receptor) ON (r.name);
CREATE INDEX patient_id IF NOT EXISTS FOR (p:Patient) ON (p.id);
CREATE INDEX condition_icd IF NOT EXISTS FOR (c:Condition) ON (c.icd_code);

// Composite index for drug class queries
CREATE INDEX drug_class IF NOT EXISTS FOR (d:Drug) ON (d.class);

// Full-text index for drug name search
CREATE FULLTEXT INDEX drug_search IF NOT EXISTS
FOR (d:Drug) ON EACH [d.name, d.brand_name];
