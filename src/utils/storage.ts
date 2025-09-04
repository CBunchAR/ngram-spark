import { Client, AnalysisHistory, StoredAnalysis } from '@/types/client';
import { SearchTermData, AnalysisResults, AnalysisConfig } from '@/types/ppc';

const STORAGE_KEYS = {
  CLIENTS: 'ngram-analyzer-clients',
  CURRENT_CLIENT: 'ngram-analyzer-current-client',
  ANALYSIS_HISTORY: 'ngram-analyzer-analysis-history',
  ANALYSIS_DATA: 'ngram-analyzer-analysis-data'
};

// Client Management
export const getClients = (): Client[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveClient = (client: Client): void => {
  const clients = getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (clientId: string): void => {
  const clients = getClients().filter(c => c.id !== clientId);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  
  // Also clean up analysis data for this client
  const allHistory = getAnalysisHistory();
  const filteredHistory = allHistory.filter(h => h.clientId !== clientId);
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(filteredHistory));
  
  // Remove stored analysis data
  filteredHistory.forEach(history => {
    localStorage.removeItem(`${STORAGE_KEYS.ANALYSIS_DATA}-${history.id}`);
  });
};

export const getCurrentClient = (): Client | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_CLIENT);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setCurrentClient = (client: Client | null): void => {
  if (client) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CLIENT, JSON.stringify(client));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CLIENT);
  }
};

// Analysis History Management
export const getAnalysisHistory = (clientId?: string): AnalysisHistory[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS_HISTORY);
    const allHistory: AnalysisHistory[] = stored ? JSON.parse(stored) : [];
    
    if (clientId) {
      return allHistory.filter(h => h.clientId === clientId);
    }
    
    return allHistory;
  } catch {
    return [];
  }
};

export const saveAnalysisHistory = (history: AnalysisHistory): void => {
  const allHistory = getAnalysisHistory();
  const existingIndex = allHistory.findIndex(h => h.id === history.id);
  
  if (existingIndex >= 0) {
    allHistory[existingIndex] = history;
  } else {
    allHistory.push(history);
  }
  
  // Sort by timestamp, newest first
  allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(allHistory));
};

export const deleteAnalysisHistory = (historyId: string): void => {
  const allHistory = getAnalysisHistory();
  const filteredHistory = allHistory.filter(h => h.id !== historyId);
  localStorage.setItem(STORAGE_KEYS.ANALYSIS_HISTORY, JSON.stringify(filteredHistory));
  
  // Also remove the stored analysis data
  localStorage.removeItem(`${STORAGE_KEYS.ANALYSIS_DATA}-${historyId}`);
};

// Analysis Data Management
export const saveAnalysisData = (
  historyId: string,
  searchTermData: SearchTermData[],
  analysisResults: AnalysisResults
): void => {
  const data: StoredAnalysis = {
    history: getAnalysisHistory().find(h => h.id === historyId)!,
    searchTermData,
    analysisResults
  };
  
  localStorage.setItem(`${STORAGE_KEYS.ANALYSIS_DATA}-${historyId}`, JSON.stringify(data));
};

export const getAnalysisData = (historyId: string): StoredAnalysis | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.ANALYSIS_DATA}-${historyId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Utility Functions
export const createClient = (name: string): Client => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];
  
  return {
    id: generateId(),
    name,
    color: colors[Math.floor(Math.random() * colors.length)],
    createdAt: new Date().toISOString(),
    totalAnalyses: 0
  };
};

export const createAnalysisHistory = (
  clientId: string,
  name: string,
  searchTermData: SearchTermData[],
  analysisResults: AnalysisResults,
  config: AnalysisConfig
): AnalysisHistory => {
  return {
    id: generateId(),
    clientId,
    name,
    timestamp: new Date().toISOString(),
    searchTermsCount: searchTermData.length,
    summary: analysisResults.summary,
    config
  };
};

export const updateClientLastAnalysis = (clientId: string): void => {
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  
  if (client) {
    client.lastAnalysis = new Date().toISOString();
    client.totalAnalyses += 1;
    saveClient(client);
  }
};

export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
  let used = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }
  
  const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
  const percentage = (used / total) * 100;
  
  return { used, total, percentage };
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear analysis data
  for (let key in localStorage) {
    if (key.startsWith(STORAGE_KEYS.ANALYSIS_DATA)) {
      localStorage.removeItem(key);
    }
  }
};

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
