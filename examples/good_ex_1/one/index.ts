/**
 * This export is unused. It's just a consumer, but we are going to try to mimic a high complexity score
 * which should indicate that it shouldn't get pulled into folder "two".
 */

import { doSomethingOne } from '../two';

export function highComplexity() {
  doSomethingOne();
  addMoreInternalComplexity();
  addMoreInternalComplexity();
  addMoreInternalComplexity();
  addMoreInternalComplexity();
}

function addMoreInternalComplexity() {
  let cnt = 0;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
  cnt++;
}
