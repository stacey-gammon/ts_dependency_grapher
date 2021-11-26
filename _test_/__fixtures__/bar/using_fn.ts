import { heavilyUsedFun } from '../foo';

function callItSoMuch() {
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
  heavilyUsedFun('hi');
}
callItSoMuch();