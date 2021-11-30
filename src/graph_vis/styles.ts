/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const BLUE = ['#BFD1FF', '#95B2FF', '#5F8BFF', '#336BFF', '#0046FF'];
export const RED = ['#FFC9C9', '#FF9393', '#FF5C5C', '#FF3131', '#FF0000'];
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
    bgColor === RED[0] ||
    bgColor === RED[1] ||
    bgColor === 'white'
    ? getCurrColorScheme()[4]
    : 'white';
}

export function getColorForLevel(level: number) {
  return getCurrColorScheme()[level % 5];
}

export function getNodeProperties(
  label: string,
  color?: string,
  size?: number,
  fontSize?: number
): string {
  if (!label) throw new Error('getNodeProperties: label not defined!');
  let colorTxt = undefined;
  let fontColor: string | undefined;

  if (color) {
    fontColor = getFontColor(color);
    colorTxt = `fillcolor="${color}", style=filled`;
  }

  const sizeAttr = size ? getSizePropertiesString(size) : '';
  const colorAttr = colorTxt ? `fillcolor="${color}", style=filled fontcolor="${fontColor}"` : '';

  return `label="${label}" ${colorAttr} ${sizeAttr} ${fontSize ? `fontsize=${fontSize}` : ''}`;
}

export function getSizePropertiesString(size: number) {
  return `fixedsize=true width=${size} height=${size}`;
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
  const newVal = val < 0 ? getWeightedSize(val, min, 0, -4, 0) : getWeightedSize(val, 0, max, 0, 4);
  return val < 0 ? RED[Math.abs(newVal)] : BLUE[newVal]; // getCurrColorScheme()[newVal];
}
