Prototype/proof-of-concept stage. Don't use for anything.

setup:
```
// install
npm i

// update types based on the new API openapi schema
npm run updateNew

// update types based on the old API openapi schema
// note: may have to downgrade openapi-typescript to support older swagger version
npm run updateOld
```

usage:
```typescript
export class ExampleComponent {
  constructor(private lajiApiClientService: LajiApiClientBService) {}
  function f() {
    // the parameters and return type should be automatically typed based on the openapi schema
    const a$ = this.lajiApiClientService.fetch('/collections', 'get', { query: { page: 1 } });
  }
}
```
