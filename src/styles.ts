/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSafeName } from './dot_utils';

export const MINT_COLOR_SCHEME = ['#C1FFF2', '#BAFFDF', '#B2EDC5', '#9DC0BC', '#7C7287'];
export const PURPLE_BLACK = ['#9DA2AB', '#A188A6', '#7F5A83', '#0D324D', '#020202'];
export const SUNRISE_SCHEME = ['#FFBA08', '#F48C06', '#DC2F02', '#9D0208', '#370617'];

export const CURR_COLOR_SCHEME = SUNRISE_SCHEME;

export function getFontColor(bgColor: string): string {
  return bgColor === CURR_COLOR_SCHEME[0] ||
    bgColor === CURR_COLOR_SCHEME[1] ||
    bgColor === CURR_COLOR_SCHEME[2]
    ? CURR_COLOR_SCHEME[4]
    : CURR_COLOR_SCHEME[0];
}

export function getColorForLevel(level: number) {
  return CURR_COLOR_SCHEME[level%5];
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
  const colorAttr = colorTxt ? `fillcolor="${color}", style=filled ${sizeAttr} fontcolor="${fontColor}"` : '';

  return `label="${getSafeName(label)}" ${colorAttr} ${sizeAttr}`;
}

export function getRelativeSizeOfNode(size: number, maxSize: number): number {
  if (isNaN(size) || isNaN(maxSize)) {
    throw new Error('NAN passed to getRelativeSizeOfNode');
  }
  const MAX_SIZE = 10;

  const comparativeApiSizeRatio = size / maxSize;

  return Math.max(comparativeApiSizeRatio * MAX_SIZE, 1);
}

export function getWeightedColor(val: number, max: number): string {
  const thresholds = [0, 0.2, 0.4, 0.7, 1];
  if (val === undefined || val === 0 || isNaN(val)) return 'yellow';
  const valRatio = val / max;

  for (let i = 0; i < thresholds.length; i++) {
    if (valRatio <= thresholds[i]) {
      return CURR_COLOR_SCHEME[i];
    }
  }

  // eslint-disable-next-line no-console
  console.warn(`${valRatio} is larger than 1! val is ${val} and max is ${max}`);

  return CURR_COLOR_SCHEME[4];
}
