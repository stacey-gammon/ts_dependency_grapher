export function getSafeName(name: string): string {
  if (name === undefined) {
    throw new Error('getSafeName: Name not defined!');
  }
  return name === 'graph' ? 'graph1' : name.replace(/[ /\-.@]/gi, '_');
}
