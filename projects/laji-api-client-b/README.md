Updating api type definitions:

```
npm i

// update types based on the new API openapi schema
npm run updateNew
```

Usage:
```typescript
export class ExampleComponent {
  constructor(private lajiApiClientService: LajiApiClientBService) {}
  function f() {
    const a$ = this.lajiApiClientService.fetch('/collections', 'get', { query: { page: 1 } });
  }
}
```

Queries are cached by default based on the path and the query params. Whenever a new non-get request is sent to the same path, the cache is flushed automatically.
