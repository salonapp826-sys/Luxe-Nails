// Distance-based home service charges (in INR)
export const HOME_SERVICE_CHARGES = [
  { minKm: 0, maxKm: 5, charge: 199 },
  { minKm: 6, maxKm: 10, charge: 299 },
  { minKm: 11, maxKm: 15, charge: 399 },
  { minKm: 16, maxKm: 20, charge: 499 },
];

export const MAX_SERVICE_DISTANCE = 20;

export function calculateHomeServiceCharge(distanceKm: number): number {
  if (distanceKm > MAX_SERVICE_DISTANCE) {
    return -1; // Not serviceable
  }

  const tier = HOME_SERVICE_CHARGES.find(
    (tier) => distanceKm >= tier.minKm && distanceKm <= tier.maxKm
  );

  return tier?.charge || 0;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}
