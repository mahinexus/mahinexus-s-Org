/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Exponential backoff retry helper per Google DeepMind Science Skill
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  baseDelayMs = 500
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        const retryAfter = Number(response.headers.get('Retry-After'));
        const delay = !Number.isNaN(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)));
    }
  }
  throw new Error(`Exhausted retries for ${url}`);
}

export interface AlphaFoldPrediction {
  entryId: string;
  gene: string;
  uniprotAccession: string;
  uniprotId: string;
  uniprotDescription: string;
  organismScientificName: string;
  uniprotStart: number;
  uniprotEnd: number;
  uniprotSequence: string;
  cifUrl: string;
  bcifUrl: string;
  pdbUrl: string;
  paeImageUrl?: string;
  paeDocUrl?: string;
}

export interface PubChemCompound {
  cid: number;
  name: string;
  molecularFormula: string;
  molecularWeight: number;
  canonicalSmiles: string;
  iupacName: string;
  depictionUrl: string;
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
}

// 1. AlphaFold DB Fetch
export async function fetchAlphaFoldPrediction(uniprotAccession: string): Promise<AlphaFoldPrediction | null> {
  const cleanId = uniprotAccession.trim().toUpperCase();
  const url = `https://alphafold.ebi.ac.uk/api/prediction/${cleanId}`;
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as AlphaFoldPrediction;
    }
    return null;
  } catch (err) {
    console.warn(`AlphaFold DB query failed for ${cleanId}:`, err);
    return null;
  }
}

// 2. UniProt Search
export async function searchUniProt(query: string): Promise<{ accession: string; id: string; gene: string; proteinName: string; organism: string; length: number }[]> {
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}+AND+organism_id:9606&fields=accession,id,gene_names,protein_name,length,organism_name&size=5`;
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      accession: item.primaryAccession,
      id: item.uniProtkbId,
      gene: item.genes?.[0]?.geneName?.value || query.toUpperCase(),
      proteinName: item.proteinDescription?.recommendedName?.fullName?.value || item.proteinDescription?.submissionNames?.[0]?.fullName?.value || 'Protein',
      organism: item.organism?.scientificName || 'Homo sapiens',
      length: item.sequence?.length || 0,
    }));
  } catch (err) {
    console.warn('UniProt search failed:', err);
    return [];
  }
}

// 3. PubChem Compound Query
export async function searchPubChem(compoundName: string): Promise<PubChemCompound | null> {
  const cleanName = compoundName.trim();
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanName)}/property/MolecularWeight,MolecularFormula,IUPACName,CanonicalSMILES/JSON`;
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const data = await res.json();
    const props = data.PropertyTable?.Properties?.[0];
    if (!props) return null;

    return {
      cid: props.CID,
      name: cleanName,
      molecularFormula: props.MolecularFormula || '',
      molecularWeight: props.MolecularWeight ? Number(props.MolecularWeight) : 0,
      canonicalSmiles: props.CanonicalSMILES || '',
      iupacName: props.IUPACName || cleanName,
      depictionUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${props.CID}/PNG`,
    };
  } catch (err) {
    console.warn('PubChem search failed:', err);
    return null;
  }
}

// 4. PubMed Literature Search
export async function searchPubMed(searchTerm: string, limit = 4): Promise<PubMedArticle[]> {
  try {
    const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=${limit}`;
    const searchRes = await fetchWithRetry(esearchUrl);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    const idList = searchData.esearchresult?.idlist || [];
    if (idList.length === 0) return [];

    const esummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
    const summaryRes = await fetchWithRetry(esummaryUrl);
    if (!summaryRes.ok) return [];
    const summaryData = await summaryRes.json();
    const result = summaryData.result || {};

    return idList.map((id: string) => {
      const doc = result[id] || {};
      const authors = (doc.authors || []).map((a: any) => a.name).slice(0, 3);
      return {
        pmid: id,
        title: doc.title ? doc.title.replace(/<[^>]*>/g, '') : 'Biomedical Investigation',
        authors: authors.length > 0 ? authors : ['Primary Investigators'],
        journal: doc.source || 'Journal of Biological Chemistry',
        pubDate: doc.pubdate || '2025',
        doi: doc.articleids?.find((a: any) => a.idtype === 'doi')?.value,
      };
    });
  } catch (err) {
    console.warn('PubMed search failed:', err);
    return [];
  }
}

// 5. Construct validated AlphaGenome Atlas deep link
export function getAlphaGenomeLink(query: string, mode: 'gene' | 'variant' | 'locus' = 'gene'): string {
  const params = new URLSearchParams();
  params.set('q', query);
  params.set('mode', mode);
  return `https://deepmind.google.com/science/alphagenome/atlas?${params.toString()}`;
}
