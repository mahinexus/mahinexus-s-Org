/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  fetchAlphaFoldPrediction,
  searchUniProt,
  searchPubChem,
  searchPubMed,
  getAlphaGenomeLink,
  AlphaFoldPrediction,
  PubChemCompound,
  PubMedArticle
} from '../../lib/scienceApi.ts';
import {
  Dna,
  Atom,
  BookOpen,
  Search,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const BioscienceWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alphafold' | 'chemistry' | 'pubmed' | 'curriculum'>('alphafold');
  const [searchQuery, setSearchQuery] = useState('TP53');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [alphaFoldData, setAlphaFoldData] = useState<AlphaFoldPrediction | null>(null);
  const [uniProtResults, setUniProtResults] = useState<any[]>([]);
  const [selectedAccession, setSelectedAccession] = useState('P04637'); // Human TP53

  // Chemical data
  const [compoundQuery, setCompoundQuery] = useState('Imatinib');
  const [compoundData, setCompoundData] = useState<PubChemCompound | null>(null);
  const [loadingCompound, setLoadingCompound] = useState(false);

  // PubMed data
  const [pubMedQuery, setPubMedQuery] = useState('TP53 AlphaFold structural variant');
  const [pubMedArticles, setPubMedArticles] = useState<PubMedArticle[]>([]);
  const [loadingPubMed, setLoadingPubMed] = useState(false);

  // Quick-Try Examples per Science Skill
  const quickExamples = [
    { label: 'TP53 (Tumor Suppressor)', query: 'TP53', accession: 'P04637', drug: 'Nutlin-3' },
    { label: 'BRCA1 (DNA Repair)', query: 'BRCA1', accession: 'P38398', drug: 'Olaparib' },
    { label: 'EGFR (Kinase)', query: 'EGFR', accession: 'P00533', drug: 'Gefitinib' },
    { label: 'INS (Insulin)', query: 'INS', accession: 'P01308', drug: 'Metformin' },
    { label: 'ACE2 (Viral Receptor)', query: 'ACE2', accession: 'Q9BYF1', drug: 'Remdesivir' },
    { label: 'ABL1 (Leukemia Target)', query: 'ABL1', accession: 'P00519', drug: 'Imatinib' }
  ];

  // Load AlphaFold & UniProt data
  const loadProteinData = async (acc: string, geneSymbol?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [afResult, upResults] = await Promise.all([
        fetchAlphaFoldPrediction(acc),
        searchUniProt(geneSymbol || acc)
      ]);
      setAlphaFoldData(afResult);
      setUniProtResults(upResults);
      setSelectedAccession(acc);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch biomolecular data');
    } finally {
      setLoading(false);
    }
  };

  // Load PubChem Compound
  const loadCompound = async (name: string) => {
    setLoadingCompound(true);
    try {
      const res = await searchPubChem(name);
      setCompoundData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompound(false);
    }
  };

  // Load PubMed Articles
  const loadLiterature = async (query: string) => {
    setLoadingPubMed(true);
    try {
      const articles = await searchPubMed(query, 4);
      setPubMedArticles(articles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPubMed(false);
    }
  };

  // Initial mount auto-load (TP53 default per Science Skill)
  useEffect(() => {
    loadProteinData('P04637', 'TP53');
    loadCompound('Imatinib');
    loadLiterature('TP53 structural genomics');
  }, []);

  const handleSelectExample = (ex: typeof quickExamples[0]) => {
    setSearchQuery(ex.query);
    setCompoundQuery(ex.drug);
    setPubMedQuery(`${ex.query} structural biology`);
    loadProteinData(ex.accession, ex.query);
    loadCompound(ex.drug);
    loadLiterature(`${ex.query} structural biology`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    loadProteinData(searchQuery.trim(), searchQuery.trim());
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      {/* Scientific Workbench Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900 text-indigo-200 flex items-center justify-center shrink-0 border border-indigo-700">
              <Dna className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Bioscience & Molecular Computing Workbench
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">
                  Science Skills Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Integrated AlphaFold DB v6, UniProtKB, PubChem PUG REST, and NCBI PubMed for academic bioinformatics coursework.
              </p>
            </div>
          </div>

          {/* Epistemic Provenance Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500 shrink-0">
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
              [AlphaFold DB v6]
            </span>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
              [UniProtKB 2026]
            </span>
            <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded">
              [PubChem PUG]
            </span>
          </div>
        </div>

        {/* Quick-Try Example Chip Bar (Mandatory Science Skill layout) */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap mr-1">
            Quick Examples:
          </span>
          {quickExamples.map((ex) => (
            <button
              key={ex.accession}
              type="button"
              onClick={() => handleSelectExample(ex)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                selectedAccession === ex.accession
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="px-5 border-b border-slate-200 bg-white flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('alphafold')}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'alphafold'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dna className="w-4 h-4 text-indigo-600" />
          <span>AlphaFold DB & Structures</span>
        </button>

        <button
          onClick={() => setActiveTab('chemistry')}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'chemistry'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Atom className="w-4 h-4 text-emerald-600" />
          <span>Chemoinformatics & PubChem</span>
        </button>

        <button
          onClick={() => setActiveTab('pubmed')}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'pubmed'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Biomedical Literature (PubMed)</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'curriculum'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-violet-600" />
          <span>Bioinformatics Syllabus & Lab Tasks</span>
        </button>
      </div>

      {/* Main Tab Content Viewport */}
      <div className="p-5">
        {/* TAB 1: AlphaFold DB & Protein Structures */}
        {activeTab === 'alphafold' && (
          <div className="space-y-5">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter UniProt accession (e.g. P04637, P38398) or human gene symbol (TP53, EGFR)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Fetch Structure</span>
              </button>
            </form>

            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p>Querying AlphaFold Protein Structure Database & UniProtKB...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : alphaFoldData ? (
              <div className="space-y-4">
                {/* Structure Overview Card */}
                <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700 px-2 py-0.5 rounded">
                          {alphaFoldData.entryId}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {alphaFoldData.gene} — {alphaFoldData.uniprotDescription}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Organism: <span className="italic">{alphaFoldData.organismScientificName}</span> · UniProt ID: <span className="font-mono">{alphaFoldData.uniprotId}</span> ({alphaFoldData.uniprotAccession})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={alphaFoldData.pdbUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDB</span>
                      </a>
                      <a
                        href={getAlphaGenomeLink(alphaFoldData.gene)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-slate-800 border border-slate-700 hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>AlphaGenome Atlas</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Canonical 4-Tier pLDDT Confidence Scale per Science Skill */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        AlphaFold pLDDT Confidence Spectrum (Predicted Local Distance Difference Test)
                      </span>
                      <span className="font-mono text-indigo-300 font-bold">
                        {alphaFoldData.uniprotEnd - alphaFoldData.uniprotStart + 1} Residues Evaluated
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-sm bg-[#0053D6] shrink-0" />
                        <div>
                          <p className="font-bold text-white font-mono text-[11px]">&gt; 90 (Very High)</p>
                          <p className="text-[10px] text-slate-400">High accuracy sidechains</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-sm bg-[#65CBF3] shrink-0" />
                        <div>
                          <p className="font-bold text-white font-mono text-[11px]">70–90 (Confident)</p>
                          <p className="text-[10px] text-slate-400">Reliable backbone fold</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-sm bg-[#FFDB13] shrink-0" />
                        <div>
                          <p className="font-bold text-white font-mono text-[11px]">50–70 (Low)</p>
                          <p className="text-[10px] text-slate-400">Flexible loop regions</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-sm bg-[#FF7D45] shrink-0" />
                        <div>
                          <p className="font-bold text-white font-mono text-[11px]">&lt; 50 (Very Low)</p>
                          <p className="text-[10px] text-slate-400">Disordered (IDPR)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protein Sequence & PAE Matrix Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sequence Viewer */}
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Primary Amino Acid Sequence</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Span: {alphaFoldData.uniprotStart}–{alphaFoldData.uniprotEnd} ({alphaFoldData.uniprotSequence?.length || 0} AA)
                      </span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-700 tracking-wider break-all max-h-36 overflow-y-auto leading-relaxed select-all">
                      {alphaFoldData.uniprotSequence || 'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGP...'}
                    </div>
                  </div>

                  {/* Predicted Aligned Error (PAE) & Coordinates */}
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                    <span className="text-xs font-bold text-slate-800">Coordinate Assets & PAE Documentation</span>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <span className="font-medium text-slate-700">mmCIF Model File (Recommended)</span>
                        <a
                          href={alphaFoldData.cifUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-mono text-[11px] font-semibold flex items-center gap-1"
                        >
                          <span>.cif (v6)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <span className="font-medium text-slate-700">BinaryCIF Coordinate Stream</span>
                        <a
                          href={alphaFoldData.bcifUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-mono text-[11px] font-semibold flex items-center gap-1"
                        >
                          <span>.bcif (Binary)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {alphaFoldData.paeDocUrl && (
                        <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                          <span className="font-medium text-slate-700">PAE Domain Matrix JSON</span>
                          <a
                            href={alphaFoldData.paeDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-mono text-[11px] font-semibold flex items-center gap-1"
                          >
                            <span>PAE Matrix Doc</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No structure records found for query. Try an accession like <code className="font-mono">P04637</code> or gene <code className="font-mono">TP53</code>.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Chemoinformatics & PubChem */}
        {activeTab === 'chemistry' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={compoundQuery}
                  onChange={(e) => setCompoundQuery(e.target.value)}
                  placeholder="Enter chemical compound name (e.g. Imatinib, Aspirin, Metformin, Doxorubicin)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => loadCompound(compoundQuery)}
                disabled={loadingCompound}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loadingCompound && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Fetch Compound</span>
              </button>
            </div>

            {compoundData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 2D Depiction Image from PubChem */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    2D Chemical Depiction (PubChem)
                  </span>
                  <div className="w-48 h-48 bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center shadow-xs">
                    <img
                      src={compoundData.depictionUrl}
                      alt={compoundData.name}
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-500 mt-2">
                    PubChem CID: {compoundData.cid}
                  </span>
                </div>

                {/* Properties & Lipinski Rule */}
                <div className="md:col-span-2 p-5 border border-slate-200 rounded-xl bg-white space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                      PubChem Compound Record
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{compoundData.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{compoundData.iupacName}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Molecular Formula</p>
                      <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {compoundData.molecularFormula}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Molecular Weight</p>
                      <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {compoundData.molecularWeight} g/mol
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Lipinski Rule of 5</p>
                      <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                        {compoundData.molecularWeight <= 500 ? 'Compliant (MW < 500)' : 'MW > 500 Da'}
                      </p>
                    </div>
                  </div>

                  {/* Canonical SMILES */}
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">Canonical SMILES String</p>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800 break-all select-all">
                      {compoundData.canonicalSmiles}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Search a small molecule name to inspect its chemical properties from PubChem PUG REST.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PubMed Literature */}
        {activeTab === 'pubmed' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={pubMedQuery}
                  onChange={(e) => setPubMedQuery(e.target.value)}
                  placeholder="Search PubMed biomedical literature (e.g. TP53 structural genomics, AlphaFold oncology)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
                />
              </div>
              <button
                type="button"
                onClick={() => loadLiterature(pubMedQuery)}
                disabled={loadingPubMed}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loadingPubMed && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Search PubMed</span>
              </button>
            </div>

            {loadingPubMed ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Searching NCBI Entrez E-utilities PubMed database...
              </div>
            ) : pubMedArticles.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No citations retrieved. Enter a query to pull peer-reviewed papers.
              </div>
            ) : (
              <div className="space-y-3">
                {pubMedArticles.map((article) => (
                  <div
                    key={article.pmid}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {article.title}
                      </h5>
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono text-xs font-semibold shrink-0 flex items-center gap-1"
                      >
                        <span>PMID: {article.pmid}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Authors: {article.authors.join(', ')} et al.
                    </p>
                    <p className="text-[11px] font-mono text-slate-500">
                      {article.journal} · Published {article.pubDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Bioinformatics Curriculum & Student Tasks */}
        {activeTab === 'curriculum' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
              <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>B.Sc. Bioinformatics & Computational Genomics Lab Tasks</span>
              </h4>
              <p className="text-slate-700 leading-relaxed">
                Students enrolled in the Department of Bioscience & Bioengineering utilize this workbench for live practical sessions and assessment evaluations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                  BIO501 · LAB 1
                </span>
                <h5 className="font-bold text-slate-900">AlphaFold pLDDT Analysis</h5>
                <p className="text-slate-500 text-[11px]">
                  Examine human TP53 pLDDT per-residue score distribution. Contrast rigid DNA-binding domain (&gt;90) with intrinsically disordered N-terminal transactivation domain (&lt;50).
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  BIO502 · LAB 2
                </span>
                <h5 className="font-bold text-slate-900">Chemoinformatics & SMILES</h5>
                <p className="text-slate-500 text-[11px]">
                  Calculate molecular descriptors for kinase inhibitor Imatinib via PubChem. Verify compliance with Lipinski Rule of 5 and molecular weight thresholds.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                  BIO503 · LAB 3
                </span>
                <h5 className="font-bold text-slate-900">PubMed Citation Synthesis</h5>
                <p className="text-slate-500 text-[11px]">
                  Retrieve peer-reviewed literature citations on BRCA1 structural mutations and cross-reference clinical significance on AlphaGenome Atlas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
