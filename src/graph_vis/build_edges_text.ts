import { getWeightedColor, getWeightedSize } from './styles';
import { GVEdgeMapping } from '../types';
import { getSafeName } from './utils';

export function getDependenciesText(edges: GVEdgeMapping) {
  console.log(`getDependenciesText: Building edges from ${Object.keys(edges).length} source nodes`);
  const maxWeight = Object.values(edges).reduce((max, { outgoing }) => {
    return outgoing.reduce((innerMax, { dependencyWeight }) => {
      return dependencyWeight > innerMax ? dependencyWeight : innerMax;
    }, max);
  }, 0);

  let text = '';
  Object.keys(edges).forEach((source) => {
    if (!source) {
      console.error(edges);
      throw new Error('getDependenciesText: source not defined in edges!');
    }
    const { outgoing } = edges[source];
    outgoing.forEach(({ dependencyWeight, node }) => {
      const color = getWeightedColor(dependencyWeight, 0, maxWeight);
      const weight = getWeightedSize(dependencyWeight, 0, maxWeight, 1, 4);
      text += `${getSafeName(source)} -> ${getSafeName(node.id)} ${
        dependencyWeight ? `[color="${color}" penwidth=${weight}]` : ''
      }\n`;
    });
  });
  return text;
}
