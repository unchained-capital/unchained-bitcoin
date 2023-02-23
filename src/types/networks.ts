import { NETWORKS } from "../networks";

type NETWORKS_KEYS = keyof typeof NETWORKS;
export type BitcoinNetwork = (typeof NETWORKS)[NETWORKS_KEYS];
