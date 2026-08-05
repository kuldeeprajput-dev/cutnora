class ObjectUrlManager {
  private urlRegistry = new Map<string, string>();

  public createUrl(key: string, blob: Blob): string {
    if (this.urlRegistry.has(key)) {
      return this.urlRegistry.get(key)!;
    }
    const url = URL.createObjectURL(blob);
    this.urlRegistry.set(key, url);
    return url;
  }

  public getUrl(key: string): string | null {
    return this.urlRegistry.get(key) || null;
  }

  public revokeUrl(key: string): void {
    const url = this.urlRegistry.get(key);
    if (url) {
      URL.revokeObjectURL(url);
      this.urlRegistry.delete(key);
    }
  }

  public revokeAll(): void {
    for (const [key, url] of this.urlRegistry.entries()) {
      URL.revokeObjectURL(url);
      this.urlRegistry.delete(key);
    }
  }
}

export const objectUrlManager = new ObjectUrlManager();
