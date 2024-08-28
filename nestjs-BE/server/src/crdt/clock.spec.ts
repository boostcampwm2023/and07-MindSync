import { COMPARE, Clock } from './clock';

it('clock 역직렬화', () => {
  const clockCount = 10;

  const clock = new Clock('123', clockCount);
  const parsedClock = Clock.parse(JSON.stringify(clock));

  expect(JSON.stringify(clock)).toEqual(JSON.stringify(parsedClock));
});

it('copy', () => {
  const clockCount = 10;

  const clock = new Clock('123', clockCount);
  const clockCopy = clock.copy();

  expect(clock === clockCopy).toBeFalsy();
  expect(JSON.stringify(clock)).toEqual(JSON.stringify(clockCopy));
});

it('increment', () => {
  const clockCount = 10;
  const incrementCount = 5;
  const expectedNumber = 15;

  const clock = new Clock('123', clockCount);

  for (let i = 0; i < incrementCount; i++) clock.increment();

  expect(clock.counter).toEqual(expectedNumber);
});

it('merge', () => {
  const clockCount10 = 10;
  const clockCount15 = 15;

  const clock1 = new Clock('123', clockCount10);
  const clock2 = new Clock('124', clockCount15);

  clock1.merge(clock2);
  clock2.merge(clock1);
});

it('compare', () => {
  const clockCount10 = 10;
  const clockCount25 = 25;

  const clock1 = new Clock('123', clockCount10);
  const clock2 = new Clock('124', clockCount25);
  const clock3 = new Clock('126', clockCount25);

  expect(clock1.compare(clock2)).toEqual(COMPARE.LESS);
  expect(clock2.compare(clock3)).toEqual(COMPARE.LESS);
});
