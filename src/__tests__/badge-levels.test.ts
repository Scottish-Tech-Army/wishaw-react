import { getBadgeLevel } from '../utils/badge-levels';

describe('getBadgeLevel', () => {
  it('returns None for 0 points', () => { expect(getBadgeLevel(0)).toBe('None'); });
  it('returns Bronze for 1-30', () => { expect(getBadgeLevel(15)).toBe('Bronze'); expect(getBadgeLevel(30)).toBe('Bronze'); });
  it('returns Silver for 31-70', () => { expect(getBadgeLevel(31)).toBe('Silver'); expect(getBadgeLevel(70)).toBe('Silver'); });
  it('returns Gold for 71-120', () => { expect(getBadgeLevel(71)).toBe('Gold'); expect(getBadgeLevel(120)).toBe('Gold'); });
  it('returns Platinum for 121+', () => { expect(getBadgeLevel(121)).toBe('Platinum'); expect(getBadgeLevel(999)).toBe('Platinum'); });
});
