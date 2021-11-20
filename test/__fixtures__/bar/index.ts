import { heavilyUsedFun } from '../foo';
import { ZED } from './zed';

export function doSomething() {
  heavilyUsedFun('hi' + ZED);
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');


}
doSomething();