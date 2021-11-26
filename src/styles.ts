/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const BLUE = ['#001A9A10', '#001A9A30', '#001A9A50', '#001A9A99', '#001A9A'];
export const SUNRISE_SCHEME = ['#FFBA08', '#F48C06', '#DC2F02', '#9D0208', '#370617'];
export const LIME = ['#F4E04D', '#F2ED6F', '#CEE397', '#8DB1AB', '#587792'];
export const MOSS = ['#EAE1DF', '#B79492', '#917C78', '#667761', '#545E56'];

//export const COLOR_SCHEMES = [SUNRISE_SCHEME, BLUE, LIME, MOSS];
export const COLOR_SCHEMES = [BLUE];

let RANDOM_COLOR_INDEX = Math.floor(Math.random() * COLOR_SCHEMES.length);
console.log('RANDOM_COLOR_INDEX', RANDOM_COLOR_INDEX);

export function getCurrColorScheme() {
  return COLOR_SCHEMES[RANDOM_COLOR_INDEX];
}

export function regenerateColorScheme() {
  RANDOM_COLOR_INDEX = Math.floor(Math.random() * COLOR_SCHEMES.length);
}

export function getFontColor(bgColor: string): string {
  return bgColor === getCurrColorScheme()[0] ||
    bgColor === getCurrColorScheme()[1] ||
    bgColor === 'white'
    ? getCurrColorScheme()[4]
    : 'white';
}

export function getColorForLevel(level: number) {
  return getCurrColorScheme()[level % 5];
}

export function getNodeProperties(label: string, color?: string, size?: number): string {
  if (!label) throw new Error('getNodeProperties: label not defined!');
  let colorTxt = undefined;
  let fontColor: string | undefined;

  if (color) {
    fontColor = getFontColor(color);
    colorTxt = `fillcolor="${color}", style=filled`;
  }

  const sizeAttr = size ? `fixedsize=true width=${size} height=${size}` : '';
  const colorAttr = colorTxt ? `fillcolor="${color}", style=filled fontcolor="${fontColor}"` : '';

  return `label="${label}" ${colorAttr} ${sizeAttr}`;
}

export function getWeightedSize(
  size: number,
  minSize: number,
  maxSize: number,
  weightedMinSize: number,
  weightedMaxSize: number
): number {
  if (isNaN(size) || isNaN(maxSize) || isNaN(weightedMaxSize) || isNaN(weightedMinSize)) {
    throw new Error(
      `NAN passed to getWeightedSize. size: ${size}, maxSize: ${maxSize}, minSize: ${minSize}, weightedMaxSize: ${weightedMaxSize}, weightedMinSize: ${weightedMinSize}`
    );
  }

  const currentRange = maxSize - minSize;
  const newRange = weightedMaxSize - weightedMinSize;
  if (currentRange == 0) return weightedMinSize;
  return Math.round(((size - minSize) * newRange) / currentRange + weightedMinSize);
}

export function getWeightedColor(val: number, min: number, max: number): string {
  const colorRange = getWeightedSize(val, min, max, 0, 5);
  return getCurrColorScheme()[colorRange];
}
