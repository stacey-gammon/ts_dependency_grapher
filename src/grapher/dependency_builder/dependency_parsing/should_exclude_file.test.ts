import { excludeFile } from './should_exclude_file';

it('exclude file', () => {
  expect(excludeFile('src/foo.foo.test.ts', ['.test.ts'])).toBeTruthy();
});
