/**
 * Quotation Storage Service
 * Handles saving and retrieving quotations from local storage
 * with optional Supabase sync capability
 */

export interface StoredItem {
  id: number;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
}

export interface StoredQuotation {
  id: string;
  quotationNumber: string;
  title: string;
  client: {
    name: string;
    company: string;
    phone: string;
    address: string;
  };
  items: StoredItem[];
  currency: string;
  discount: number;
  depositPct: number;
  exchangeRate: number;
  subtotal: number;
  total: number;
  status: "draft" | "sent" | "accepted" | "paid";
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "babc_quotations";
const DRAFTS_KEY = "babc_drafts";

/**
 * Get all saved quotations
 */
export function getSavedQuotations(): StoredQuotation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading quotations:", error);
    return [];
  }
}

/**
 * Save a new quotation
 */
export function saveQuotation(quotation: Omit<StoredQuotation, "id" | "createdAt" | "updatedAt">): StoredQuotation {
  const quotations = getSavedQuotations();
  const now = new Date().toISOString();
  
  const newQuotation: StoredQuotation = {
    ...quotation,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  quotations.push(newQuotation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
  
  // Verify save was successful
  const saved = localStorage.getItem(STORAGE_KEY);
  console.log("📦 Storage save check:", saved ? `${JSON.parse(saved).length} items in storage` : "ERROR: Storage empty");
  
  return newQuotation;
}

/**
 * Update an existing quotation
 */
export function updateQuotation(id: string, updates: Partial<StoredQuotation>): StoredQuotation | null {
  const quotations = getSavedQuotations();
  const index = quotations.findIndex(q => q.id === id);

  if (index === -1) return null;

  const updated: StoredQuotation = {
    ...quotations[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  quotations[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
  
  return updated;
}

/**
 * Get a single quotation by ID
 */
export function getQuotation(id: string): StoredQuotation | null {
  const quotations = getSavedQuotations();
  return quotations.find(q => q.id === id) || null;
}

/**
 * Delete a quotation
 */
export function deleteQuotation(id: string): boolean {
  const quotations = getSavedQuotations();
  const filtered = quotations.filter(q => q.id !== id);

  if (filtered.length === quotations.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Save a draft quotation (auto-save)
 */
export function saveDraft(quotation: Omit<StoredQuotation, "id" | "createdAt" | "updatedAt">): StoredQuotation {
  const drafts = getDrafts();
  const now = new Date().toISOString();
  
  const draft: StoredQuotation = {
    ...quotation,
    id: "draft_" + crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };

  drafts.push(draft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  
  return draft;
}

/**
 * Update a draft
 */
export function updateDraft(id: string, updates: Partial<StoredQuotation>): StoredQuotation | null {
  const drafts = getDrafts();
  const index = drafts.findIndex(d => d.id === id);

  if (index === -1) return null;

  const updated: StoredQuotation = {
    ...drafts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  drafts[index] = updated;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  
  return updated;
}

/**
 * Get all drafts
 */
export function getDrafts(): StoredQuotation[] {
  try {
    const data = localStorage.getItem(DRAFTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading drafts:", error);
    return [];
  }
}

/**
 * Convert draft to sent quotation
 */
export function convertDraftToQuotation(draftId: string): StoredQuotation | null {
  const drafts = getDrafts();
  const draftIndex = drafts.findIndex(d => d.id === draftId);

  if (draftIndex === -1) return null;

  const draft = drafts[draftIndex];
  const quotation = saveQuotation({
    ...draft,
    status: "sent",
  });

  // Remove from drafts
  drafts.splice(draftIndex, 1);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

  return quotation;
}

/**
 * Delete a draft
 */
export function deleteDraft(id: string): boolean {
  const drafts = getDrafts();
  const filtered = drafts.filter(d => d.id !== id);

  if (filtered.length === drafts.length) return false;

  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get statistics
 */
export function getStatistics() {
  const quotations = getSavedQuotations();
  const drafts = getDrafts();

  return {
    totalQuotations: quotations.length,
    totalDrafts: drafts.length,
    sentQuotations: quotations.filter(q => q.status === "sent").length,
    acceptedQuotations: quotations.filter(q => q.status === "accepted").length,
    paidQuotations: quotations.filter(q => q.status === "paid").length,
    totalValue: quotations.reduce((sum, q) => sum + q.total, 0),
  };
}
