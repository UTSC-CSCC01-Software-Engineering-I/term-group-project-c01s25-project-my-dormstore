import { DormChecklistItems } from '../data/DormChecklistItems';

describe('DormChecklistItems data structure', () => {
  it('should be defined and an object', () => {
    expect(DormChecklistItems).toBeDefined();
    expect(typeof DormChecklistItems).toBe('object');
  });

  it('should contain at least one residence', () => {
    const keys = Object.keys(DormChecklistItems);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('should have valid checklist arrays for each residence', () => {
    Object.entries(DormChecklistItems).forEach(([residence, checklist]) => {
      expect(Array.isArray(checklist)).toBe(true);
      checklist.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(typeof item.id).toBe('number');
        expect(item).toHaveProperty('label');
        expect(typeof item.label).toBe('string');
        expect(item).toHaveProperty('checked');
        expect(typeof item.checked).toBe('boolean');
      });
    });
  });

  it('should contain specific known residence data', () => {
    const sample = DormChecklistItems['Algoma Dormitory'];
    expect(sample).toBeDefined();
    expect(sample.length).toBeGreaterThan(0);
    expect(sample[0]).toEqual({ id: 1, label: 'Twin Sheet', checked: false });
  });

  it('should contain "default" as a fallback key with expected items', () => {
    expect(DormChecklistItems).toHaveProperty('default');
    const defaultItems = DormChecklistItems['default'];
    expect(defaultItems.length).toBeGreaterThan(0);
    const labels = defaultItems.map(item => item.label);
    expect(labels).toContain('Bedding');
    expect(labels).toContain('Tech essentials');
  });

  it('should not contain duplicate keys like "55 University Ave"', () => {
    const keys = Object.keys(DormChecklistItems);
    const duplicates = keys.filter((key, idx) => keys.indexOf(key) !== idx);
    expect(duplicates).toEqual([]); // Make sure to remove duplicates in source file
  });
});
