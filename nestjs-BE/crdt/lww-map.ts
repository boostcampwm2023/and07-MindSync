import { LWWRegister, lwwRegisterState } from './lww-register';

export type lwwMapState<T> = {
  [key: string]: lwwRegisterState<T>;
};

export class LWWMap<T> {
  readonly id: string;
  private data = new Map<string, LWWRegister<T | null>>();

  constructor(id: string, state: lwwMapState<T> = {}) {
    this.id = id;
    this.initializeData(state);
  }

  private initializeData(state: lwwMapState<T>): void {
    for (const [key, register] of Object.entries(state))
      this.data.set(key, new LWWRegister(this.id, register));
  }

  getState(): lwwMapState<T> {
    const state: lwwMapState<T> = {};
    for (const [key, register] of this.data.entries())
      if (register) state[key] = register.state;
    return state;
  }

  get(key: string): T | null | undefined {
    return this.data.get(key)?.getValue();
  }

  set(key: string, value: T): void {
    const register = this.data.get(key);
    if (register) register.setValue(value);
    else
      this.data.set(
        key,
        new LWWRegister(this.id, {
          id: this.id,
          timestamp: Date.now(),
          value,
        }),
      );
  }

  delete(key: string): void {
    this.data.get(key)?.setValue(null);
  }

  has(key: string): boolean {
    return !!this.data.get(key)?.getValue();
  }

  clear(): void {
    for (const [key, register] of this.data.entries())
      if (register) this.delete(key);
  }

  merge(state: lwwMapState<T>): void {
    for (const [key, remoteRegister] of Object.entries(state)) {
      const local = this.data.get(key);
      if (local) local.merge(remoteRegister);
      else this.data.set(key, new LWWRegister(this.id, remoteRegister));
    }
  }
}
