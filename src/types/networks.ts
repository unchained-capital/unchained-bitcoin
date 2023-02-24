import { NETWORKS, SIGNET, REGTEST } from "../networks";

const NETWORKS_ENUM = {
  ...NETWORKS,
  REGTEST,
  SIGNET,
} as const;

type NETWORKS_KEYS = keyof typeof NETWORKS_ENUM;
export type BitcoinNetwork = (typeof NETWORKS_ENUM)[NETWORKS_KEYS];
