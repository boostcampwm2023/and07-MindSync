import { v1 as uuid1 } from 'uuid';

export default function generateUuid(): string {
  const [first, second, third, fourth, fifth] = uuid1().split('-');
  return third + second + first + fourth + fifth;
}
