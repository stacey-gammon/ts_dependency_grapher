import { innerFnThree } from './three';
import { innerFnTwo } from './two';

export function outerFn3() {
  innerFnTwo();
  innerFnThree();
}
