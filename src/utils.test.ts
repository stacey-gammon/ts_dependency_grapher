import { getParentFolder, getRootRelativePath } from './utils';

it('getRootRelativePath', () => {
  expect(getRootRelativePath('users/gammon/foo/bar', 'users/gammon/foo')).toBe('/bar');
});

it('getParentFolder', () => {
  expect(getParentFolder('root/foo/bar')).toBe('root/foo');
  expect(getParentFolder('root/foo/bar/')).toBe('root/foo/bar');
});

it('getParentFolder on top level', () => {
  expect(getParentFolder('src')).toBe('');
});

it('getParentFolder on top level with starting slash', () => {
  expect(getParentFolder('/src')).toBe('');
});

it('getParentFolder on empty string', () => {
  expect(getParentFolder('')).toBe('');
});
