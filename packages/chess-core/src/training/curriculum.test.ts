import { describe, expect, it } from 'vitest';
import { CURRICULUM, getNode, getUnitForNode } from './curriculum';

describe('curriculum', () => {
  it('defines 6 units and 18 main-path nodes', () => {
    expect(CURRICULUM.units).toHaveLength(6);
    expect(CURRICULUM.mainPathNodeIds).toHaveLength(18);
  });

  it('assigns 3 puzzles per node', () => {
    for (const nodeId of CURRICULUM.mainPathNodeIds) {
      const node = getNode(nodeId);
      expect(node?.puzzles).toHaveLength(3);
      expect(node?.passThreshold).toBe(2);
    }
  });

  it('resolves unit for node', () => {
    expect(getUnitForNode('node-1-1')?.id).toBe('unit-1');
    expect(getUnitForNode('node-4-2')?.title).toBe('Tactical Sight');
  });
});
