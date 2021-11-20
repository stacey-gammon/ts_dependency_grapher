# A TypeScript dependency graph builder


To build the GraphVis dot file:
```
yarn dep --tsconfig [TSCONFIGPATH] --output [OUTPUTFILE]
```

An example:
```
yarn dep --tsconfig ../blueprint/packages/core/src/tsconfig.json  --output test.dot
```

Then to build the Graph:

```
fdp -x -Goverlap=scale -Tpng test.dot > test.png
```