import { Tree } from './tree';

it('isAncestor', () => {
  const tree = new Tree();

  tree.addNode('a', 'root', 'test');
  tree.addNode('b', 'a', 'test');
  tree.addNode('c', 'b', 'test');
  tree.addNode('d', 'a', 'test');
  tree.addNode('e', 'b', 'test');

  expect(tree.isAncestor('c', 'a')).toBeTruthy();
  expect(tree.isAncestor('c', 'root')).toBeTruthy();
  expect(tree.isAncestor('d', 'root')).toBeTruthy();
  expect(tree.isAncestor('d', 'a')).toBeTruthy();
  expect(tree.isAncestor('c', 'e')).toBeFalsy();
  expect(tree.isAncestor('e', 'c')).toBeFalsy();
  expect(tree.isAncestor('c', 'd')).toBeFalsy();
});
