export type TrustLevel =
  | 'UNKNOWN'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'VERIFIED'
  | 'SYSTEM_APPROVED';

export const TRUST_LEVEL_WEIGHTS: Readonly<Record<TrustLevel, number>> = Object.freeze({
  UNKNOWN: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERIFIED: 4,
  SYSTEM_APPROVED: 5
});
