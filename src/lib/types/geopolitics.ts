export type GeopoliticalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GeopoliticalRiskZone {
  id: string;
  regionName: string;
  countryCode: string;
  riskLevel: GeopoliticalRiskLevel;
  category: 'TRADE_TARIFF' | 'LOGISTICS_CHOKEPOINT' | 'ENVIRONMENTAL_RESTRICTION' | 'SANCTIONS_RISK';
  title: string;
  summary: string;
  impactScore: number; // 0 - 100
  affectedAreas: string[]; // Area IDs (e.g. area-1, area-3)
  coordinates: { lat: number; lon: number };
  updatedAt: string;
}

export interface TradeCorridor {
  id: string;
  name: string;
  origin: { name: string; lat: number; lon: number };
  destination: { name: string; lat: number; lon: number };
  status: 'ACTIVE' | 'DISRUPTED' | 'MONITORED';
  commodity: 'COPPER_CABLE' | 'SCRAP_METAL' | 'INDUSTRIAL_PARTS';
  annualVolumeTons: number;
}

export interface GeopoliticalLayerConfig {
  showTradeCorridors: boolean;
  showRiskZones: boolean;
  showTariffAlerts: boolean;
  showSupplyChainChokepoints: boolean;
}
