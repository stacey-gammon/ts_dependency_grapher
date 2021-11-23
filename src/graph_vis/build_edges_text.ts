import { getWeightedColor, getWeightedSize } from '../styles';
import { GVEdgeMapping } from '../types';
import { getSafeName } from './utils';

export function getDependenciesText(edges: GVEdgeMapping) {
  const maxWeight = Object.values(edges).reduce((max, dests) => {
    return dests.reduce((innerMax, dest) => {
      return dest.weight > innerMax ? dest.weight : innerMax;
    }, max);
  }, 0);

  let text = '';
  Object.keys(edges).forEach((source) => {
    if (!source) {
      console.error(edges);
      throw new Error('getDependenciesText: source not defined in edges!');
    }
    const dests = edges[source];
    dests.forEach((dest) => {
      if (!dest.dest) {
        console.error(dest);
        console.error(edges);
        throw new Error('getDependenciesText: dest.dest not defined!');
      }
      const color = getWeightedColor(dest.weight, maxWeight);
      const weight = getWeightedSize(dest.weight, maxWeight, 15, 2);
      text += `${getSafeName(source)} -> ${getSafeName(dest.dest)} ${
        dest.weight ? `[color="${color}" penwidth=${weight}]` : ''
      }\n`;
    });
  });
  return text;
}
