export function getQuartile(data: number[], q: number) {
  const sorted = sortNumbers(data);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

function sortNumbers(input: number[]) {
  return input.sort(function (a, b) {
    return a - b;
  });
}
