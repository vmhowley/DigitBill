type Listener = (isLoading: boolean) => void;

class LoaderService {
  private _isLoading = false;
  private listeners: Listener[] = [];
  private requestCount = 0;

  get isLoading() {
    return this._isLoading;
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show() {
    this.requestCount++;
    if (!this._isLoading) {
      this._isLoading = true;
      this.notify();
    }
  }

  hide() {
    if (this.requestCount > 0) {
      this.requestCount--;
    }
    
    if (this.requestCount === 0 && this._isLoading) {
      this._isLoading = false;
      this.notify();
    }
  }

  private notify() {
    this.listeners.forEach(l => l(this._isLoading));
  }
}

export const loaderService = new LoaderService();
