/**
 * This export is unused. It's just a consumer, but we are going to try to mimic a high complexity score
 * which should indicate that it shouldn't get pulled into folder "two".
 */

import { fnFive, fnFour, fnOne, fnThree, fnTwo } from '../two/large_public_api';

export function unusedFn() {
  fnOne();
  fnTwo();
  fnThree();
  fnFive();
  fnFour();
}
