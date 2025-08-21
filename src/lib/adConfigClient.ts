import { AdConfig, AdSlot, AdAuditEntry } from '@/types/ads';

const MOCK_API_DELAY = 300; // Simulate network delay

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage key for persistence
const STORAGE_KEY = 'ad-config-data';

// Load initial data from mock or localStorage
async function loadInitialData(): Promise<AdConfig> {
  // Try localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored ad config, loading from mock');
    }
  }

  // Fallback to mock data
  const response = await fetch('/mocks/ad-config.json');
  const data = await response.json();
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Save data to localStorage
function saveToStorage(config: AdConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Generate unique ID
function generateId(): string {
  return `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate audit entry
function createAuditEntry(
  action: AdAuditEntry['action'],
  slotId: string,
  changes?: Partial<AdSlot>
): AdAuditEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    slotId,
    userId: 'admin-001', // Mock user ID
    changes
  };
}

export class AdConfigClient {
  private static instance: AdConfigClient;
  private config: AdConfig | null = null;

  static getInstance(): AdConfigClient {
    if (!AdConfigClient.instance) {
      AdConfigClient.instance = new AdConfigClient();
    }
    return AdConfigClient.instance;
  }

  async getConfig(): Promise<AdConfig> {
    await delay(MOCK_API_DELAY);
    
    if (!this.config) {
      this.config = await loadInitialData();
    }
    return this.config;
  }

  async updateSlot(slotId: string, updates: Partial<AdSlot>): Promise<AdSlot> {
    await delay(MOCK_API_DELAY);
    
    const config = await this.getConfig();
    const slotIndex = config.slots.findIndex(slot => slot.id === slotId);
    
    if (slotIndex === -1) {
      throw new Error(`Slot ${slotId} not found`);
    }

    const originalSlot = config.slots[slotIndex];
    const updatedSlot = {
      ...originalSlot,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    config.slots[slotIndex] = updatedSlot;
    config.version = new Date().toISOString();
    config.updatedAt = new Date().toISOString();
    
    // Add audit entry
    config.auditLog.unshift(createAuditEntry('updated', slotId, updates));
    
    // Keep only last 100 audit entries
    config.auditLog = config.auditLog.slice(0, 100);

    saveToStorage(config);
    this.config = config;

    return updatedSlot;
  }

  async createSlot(slot: Omit<AdSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdSlot> {
    await delay(MOCK_API_DELAY);
    
    const config = await this.getConfig();
    const now = new Date().toISOString();
    
    const newSlot: AdSlot = {
      ...slot,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };

    config.slots.unshift(newSlot);
    config.version = now;
    config.updatedAt = now;
    
    // Add audit entry
    config.auditLog.unshift(createAuditEntry('created', newSlot.id));

    saveToStorage(config);
    this.config = config;

    return newSlot;
  }

  async duplicateSlot(slotId: string): Promise<AdSlot> {
    await delay(MOCK_API_DELAY);
    
    const config = await this.getConfig();
    const originalSlot = config.slots.find(slot => slot.id === slotId);
    
    if (!originalSlot) {
      throw new Error(`Slot ${slotId} not found`);
    }

    const now = new Date().toISOString();
    const duplicatedSlot: AdSlot = {
      ...originalSlot,
      id: generateId(),
      section: `${originalSlot.section} (Copy)`,
      status: 'off', // Start duplicated slots as off
      createdAt: now,
      updatedAt: now
    };

    config.slots.unshift(duplicatedSlot);
    config.version = now;
    config.updatedAt = now;
    
    // Add audit entry
    config.auditLog.unshift(createAuditEntry('duplicated', duplicatedSlot.id));

    saveToStorage(config);
    this.config = config;

    return duplicatedSlot;
  }

  async deleteSlot(slotId: string): Promise<void> {
    await delay(MOCK_API_DELAY);
    
    const config = await this.getConfig();
    const slotIndex = config.slots.findIndex(slot => slot.id === slotId);
    
    if (slotIndex === -1) {
      throw new Error(`Slot ${slotId} not found`);
    }

    config.slots.splice(slotIndex, 1);
    config.version = new Date().toISOString();
    config.updatedAt = new Date().toISOString();
    
    // Add audit entry
    config.auditLog.unshift(createAuditEntry('deleted', slotId));

    saveToStorage(config);
    this.config = config;
  }

  async exportConfig(): Promise<string> {
    const config = await this.getConfig();
    return JSON.stringify(config, null, 2);
  }

  async importConfig(configJson: string): Promise<AdConfig> {
    await delay(MOCK_API_DELAY);
    
    try {
      const newConfig: AdConfig = JSON.parse(configJson);
      
      // Validate basic structure
      if (!newConfig.slots || !Array.isArray(newConfig.slots)) {
        throw new Error('Invalid config format: missing slots array');
      }

      // Update version and timestamp
      newConfig.version = new Date().toISOString();
      newConfig.updatedAt = new Date().toISOString();
      
      if (!newConfig.auditLog) {
        newConfig.auditLog = [];
      }

      saveToStorage(newConfig);
      this.config = newConfig;

      return newConfig;
    } catch (error) {
      throw new Error(`Failed to import config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async resetToDefault(): Promise<AdConfig> {
    // Remove from localStorage and reload from mock
    localStorage.removeItem(STORAGE_KEY);
    this.config = null;
    return this.getConfig();
  }
}

export const adConfigClient = AdConfigClient.getInstance();
