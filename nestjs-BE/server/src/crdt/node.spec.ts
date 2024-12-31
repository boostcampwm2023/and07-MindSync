import { Node } from './node';

it('node 역직렬화', () => {
  const node = new Node('1', 'root', 'hello');
  const parsedNode = Node.parse(JSON.stringify(node));

  expect(JSON.stringify(node)).toEqual(JSON.stringify(parsedNode));
});
