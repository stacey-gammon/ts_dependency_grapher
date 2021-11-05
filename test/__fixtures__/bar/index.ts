import { heavilyUsedFun } from '../foo';

export function doSomething() {
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
}
doSomething();