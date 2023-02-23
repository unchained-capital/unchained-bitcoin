// P2TR not able to be used anywhere yet but technicall a valid multisig
// address type.
// We should be able to replace this with use of the MULTISIG_ADDREESS_TYPES
// enum when that file (./multisig.js) gets converted to typescript
export type MultisigAddressType = "P2SH" | "P2WSH" | "P2SH-P2WSH" | "P2TR";
