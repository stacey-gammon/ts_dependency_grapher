import { outerFn2 } from '../two/one';
import { innerFnThree } from './three';
import { innerFnTwo } from './two';

export function outerFn1() {
  innerFnTwo();
  innerFnThree();

  outerFn2();
}
