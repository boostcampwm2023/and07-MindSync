export interface lwwRegisterState<T> {
  id: string;
  timestamp: number;
  value: T;
}

export class LWWRegister<T> {
  readonly id: string;
  state: lwwRegisterState<T>;

  constructor(id: string, state: lwwRegisterState<T>) {
    this.id = id;
    this.state = state;
  }

  getValue(): T {
    return this.state.value;
  }

  setValue(value: T): void {
    this.state = { id: this.id, timestamp: this.state.timestamp + 1, value };
  }

  merge(state: lwwRegisterState<T>): void {
    const { id: remoteId, timestamp: remoteTimestamp } = state;
    const { id: localId, timestamp: localTimestamp } = this.state;
    if (localTimestamp > remoteTimestamp) return;
    if (localTimestamp === remoteTimestamp && localId > remoteId) return;
    this.state = state;
  }
}
