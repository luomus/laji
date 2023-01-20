export class BoxCache<D> {
  private cache: { bounds?: any; aggregateLevel: number; data: D }[] = [];
  private cacheSize = 5;

  match(bounds: any, aggregateLevel: number, finnishMode: boolean): D | null {
    if (!bounds) { return null; }
    for (const c of this.cache) {
      // if !c.bounds then the query was unbounded and we should match it as long as aggregateLevel matches,
      // otherwise we need to check if the cached query contains the new bounds
      if ((c.aggregateLevel === aggregateLevel || finnishMode) && (!c.bounds || c.bounds.pad(.1).contains(bounds))) {
        return c.data;
      }
    }
    return null;
  }

  update(aggregateLevel: number, bounds: any, data: D) {
    this.cache.push({ aggregateLevel, bounds, data });
    if (this.cache.length > this.cacheSize) {
      this.cache.shift();
    }
  }

  reset() {
    this.cache = [];
  }
}
