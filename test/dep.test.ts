import { getDotFileText } from '../src/build_dot'
import Path from 'path';


it('suite', () => {
  const text = getDotFileText({
    entry: Path.resolve(__dirname, './__fixtures__/foo/index.ts'),
    tsconfig: Path.resolve(__dirname, './__fixtures__/tsconfig.json') 
  });
  expect(text).toBeDefined();
  expect(text).toMatchInlineSnapshot(`
"digraph test{
    /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsUNUSED_CONST

     /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/indextsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/indextsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/indextsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/indextsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/indextsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/indextsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/indextsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/using_fntsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/using_fntsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/using_fntsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/using_fntsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/using_fntsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/using_fntsNoName 
/Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/foo/indextsheavilyUsedFun -> /Users/gammon/Personal/ts_dependency_grapher/test/__fixtures__/bar/using_fntsNoName 

  }"
`);
})