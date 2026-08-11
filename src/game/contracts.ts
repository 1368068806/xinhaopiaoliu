import type { Contract } from './types';

export const CONTRACTS: Contract[] = [
  {
    id: 'near',
    name: '近区快递',
    description: '把老城区的数据包送到东岸中继塔。静电体稀疏，适合热身。',
    difficulty: '平稳',
    reward: 40,
    ghostCount: 4,
    ghostSpeed: 62,
    chaseSpeed: 108,
    packetMax: 90,
    destination: { i: 3, j: 1 },
  },
  {
    id: 'mid',
    name: '中区急件',
    description: '穿过货运站与淹没广场。静电体更多，修复节点藏在半路。',
    difficulty: '危险',
    reward: 75,
    ghostCount: 7,
    ghostSpeed: 74,
    chaseSpeed: 120,
    packetMax: 72,
    destination: { i: 4, j: 2 },
  },
  {
    id: 'deep',
    name: '深区绝密',
    description: '横跨整座城，最远、最密、最快。只有最稳的信使能活着送达。',
    difficulty: '致命',
    reward: 120,
    ghostCount: 10,
    ghostSpeed: 86,
    chaseSpeed: 134,
    packetMax: 55,
    destination: { i: 4, j: 3 },
  },
];

export function getContract(id: string): Contract {
  return CONTRACTS.find((c) => c.id === id) ?? CONTRACTS[0];
}
