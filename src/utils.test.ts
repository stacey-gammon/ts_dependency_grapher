import { getRootRelativePath } from './utils'


it('getRootRelativePath', () => {
  expect(getRootRelativePath('users/gammon/foo/bar', 'users/gammon/foo')).toBe('/bar');
});