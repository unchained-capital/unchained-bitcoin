import { Networks } from "../networks";

type NETWORKS_KEYS = keyof typeof Networks;
export type BitcoinNetwork = (typeof Networks)[NETWORKS_KEYS];
