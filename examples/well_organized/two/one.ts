import { outerFn3 } from '../three/one';
import { innerFnThree } from './three';
import { innerFnTwo } from './two';

export function outerFn2() {
  innerFnTwo();
  innerFnThree();

  outerFn3();
}
