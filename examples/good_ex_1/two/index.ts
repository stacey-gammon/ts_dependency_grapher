export function doSomethingOne() {
  doSomethingDepOne();
  doSomethingDeptwo();
  doSomethingDepThree();
}

let cnt = 0;

function doSomethingDepOne() {
  cnt++;
}

function doSomethingDeptwo() {
  cnt++;
}

function doSomethingDepThree() {
  cnt++;
  return cnt;
}
