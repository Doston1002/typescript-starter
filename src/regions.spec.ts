import { describe, expect, it } from 'vitest';
import { districtsByRegionId, getDistrictLabel, regions } from './regions.js';

describe('regions', () => {
  it('includes all 14 regions and their district lists', () => {
    expect(regions).toHaveLength(14);
    for (const region of regions) {
      expect(districtsByRegionId[region.id]?.length).toBeGreaterThan(0);
    }
  });

  it('formats district and city labels in the selected language', () => {
    expect(getDistrictLabel('Nukus shahar', 'uz')).toBe('Nukus shahar');
    expect(getDistrictLabel('Nukus shahar', 'ru')).toBe('г. Нукус');
    expect(getDistrictLabel('Nukus tumani', 'ru')).toBe('район Нукус');
  });
});
