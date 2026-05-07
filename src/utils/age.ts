/**
 * Calculate age in years from a date-of-birth string (yyyy-MM-dd).
 * Returns null if dob is falsy or invalid.
 */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format age for display: returns "X yrs" or "—" if unknown.
 */
export function formatAge(dob: string | null | undefined): string {
  const age = calculateAge(dob);
  return age !== null ? `${age} yrs` : '—';
}

