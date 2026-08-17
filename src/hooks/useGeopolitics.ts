'use client';

import { useState } from 'react';
import {
  GeopoliticalRiskZone,
  TradeCorridor,
  GeopoliticalLayerConfig,
} from '@/lib/types/geopolitics';

const MOCK_GEOPOLITICAL_RISK_ZONES: GeopoliticalRiskZone[] = [
  {
    id: 'geo-risk-1',
    regionName: 'Canal de Panamá & Rotas Marítimas',
    countryCode: 'PA',
    riskLevel: 'MEDIUM',
    category: 'LOGISTICS_CHOKEPOINT',
    title: 'Restrição de Calado e Fila de Frete Marítimo',
    summary: 'Atraso médio de 4 dias no transporte de sucata de cobre importada da América do Norte.',
    impactScore: 68,
    affectedAreas: ['area-1', 'area-3'],
    coordinates: { lat: 8.9824, lon: -79.5199 },
    updatedAt: '2026-08-12T18:00:00Z',
  },
  {
    id: 'geo-risk-2',
    regionName: 'União Europeia & Regulamentação CBAM',
    countryCode: 'EU',
    riskLevel: 'HIGH',
    category: 'TRADE_TARIFF',
    title: 'Taxação de Carbono na Fronteira (CBAM 2026)',
    summary: 'Exigência de declaração de pegada de carbono para lote de exportação de vergalhão Dcopper.',
    impactScore: 82,
    affectedAreas: ['area-2', 'area-10'],
    coordinates: { lat: 50.8503, lon: 4.3517 },
    updatedAt: '2026-08-12T14:30:00Z',
  },
  {
    id: 'geo-risk-3',
    regionName: 'Fronteira Tríplice Mercosul',
    countryCode: 'BR',
    riskLevel: 'LOW',
    category: 'ENVIRONMENTAL_RESTRICTION',
    title: 'Fiscalização de Licenciamento Ambiental de Sucata',
    summary: 'Operação conjunta de fiscalização de carga de ligas metálicas.',
    impactScore: 35,
    affectedAreas: ['area-1', 'area-6'],
    coordinates: { lat: -25.516, lon: -54.585 },
    updatedAt: '2026-08-12T10:00:00Z',
  },
];

const MOCK_TRADE_CORRIDORS: TradeCorridor[] = [
  {
    id: 'corridor-1',
    name: 'Rota Marítima LME Antofagasta -> Santos',
    origin: { name: 'Porto de Antofagasta (Chile)', lat: -23.65, lon: -70.4 },
    destination: { name: 'Porto de Santos (SP)', lat: -23.96, lon: -46.3 },
    status: 'ACTIVE',
    commodity: 'SCRAP_METAL',
    annualVolumeTons: 120000,
  },
  {
    id: 'corridor-2',
    name: 'Corredor de Exportação Dcopper Santos -> Roterdã',
    origin: { name: 'Porto de Santos (SP)', lat: -23.96, lon: -46.3 },
    destination: { name: 'Porto de Roterdã (Holanda)', lat: 51.92, lon: 4.47 },
    status: 'MONITORED',
    commodity: 'COPPER_CABLE',
    annualVolumeTons: 85000,
  },
];

export function useGeopolitics() {
  const [riskZones] = useState<GeopoliticalRiskZone[]>(MOCK_GEOPOLITICAL_RISK_ZONES);
  const [tradeCorridors] = useState<TradeCorridor[]>(MOCK_TRADE_CORRIDORS);
  const [layerConfig, setLayerConfig] = useState<GeopoliticalLayerConfig>({
    showTradeCorridors: true,
    showRiskZones: true,
    showTariffAlerts: true,
    showSupplyChainChokepoints: false,
  });

  const toggleLayer = (key: keyof GeopoliticalLayerConfig) => {
    setLayerConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return {
    riskZones,
    tradeCorridors,
    layerConfig,
    toggleLayer,
  };
}
