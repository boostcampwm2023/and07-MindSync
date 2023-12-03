export enum COMPARE {
  GREATER,
  LESS,
}

export class Clock {
  id: string;
  counter: number;

  constructor(id: string, counter: number = 0) {
    this.id = id;
    this.counter = counter;
  }

  increment() {
    this.counter++;
  }

  copy(): Clock {
    return new Clock(this.id, this.counter);
  }

  merge(remoteClock: Clock): Clock {
    return new Clock(this.id, Math.max(this.counter, remoteClock.counter));
  }

  compare(remoteClock: Clock): COMPARE {
    if (this.counter > remoteClock.counter) return COMPARE.GREATER;
    if (this.counter === remoteClock.counter && this.id > remoteClock.id) {
      return COMPARE.GREATER;
    }
    return COMPARE.LESS;
  }
}
