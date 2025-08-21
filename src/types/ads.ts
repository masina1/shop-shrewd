export type AdStatus = 'off' | 'on' | 'preview';
export type AdProvider = 'gpt' | 'affiliates' | 'house';
export type LazyUntil = 'visible' | 'idle' | 'immediate';

export interface AdSize {
  width: number;
  height: number;
}

export interface AdTargeting {
  [key: string]: string;
}

export interface AdSlot {
  id: string;
  routePattern: string;
  section: string;
  status: AdStatus;
  provider: AdProvider;
  countries: string[];
  sizes: AdSize[];
  updatedAt: string;
  unitPath?: string;
  targeting: AdTargeting;
  lazyUntil: LazyUntil;
  createdAt: string;
}

export interface AdConfig {
  version: string;
  updatedAt: string;
  slots: AdSlot[];
  auditLog: AdAuditEntry[];
}

export interface AdAuditEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'updated' | 'deleted' | 'duplicated';
  slotId: string;
  userId: string;
  changes?: Partial<AdSlot>;
}