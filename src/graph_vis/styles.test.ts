import { getWeightedSize } from './styles';

it('getWeightedSize', () => {
  expect(getWeightedSize(1, 1, 1, 1, 10)).toBe(1);
  expect(getWeightedSize(5, 5, 10, 1, 10)).toBe(1);
  expect(getWeightedSize(10, 5, 10, 1, 10)).toBe(10);
});
