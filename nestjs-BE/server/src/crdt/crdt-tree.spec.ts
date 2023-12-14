import { CrdtTree } from './crdt-tree';

it('crdt tree 동기화', () => {
  const tree1 = new CrdtTree<string>('1');
  const tree2 = new CrdtTree<string>('2');

  const op_1_1 = tree1.generateOperationAdd('a', 'root', 'hello');
  const op_1_2 = tree1.generateOperationAdd('b', 'root', 'hi');

  const op_2_1 = tree2.generateOperationAdd('c', 'root', 'good');
  const op_2_2 = tree2.generateOperationAdd('d', 'c', 'bad');

  tree1.applyOperations([op_1_1, op_1_2]);
  tree2.applyOperations([op_2_1, op_2_2]);

  tree2.applyOperations([op_1_1, op_1_2]);
  tree1.applyOperations([op_2_1, op_2_2]);

  const op_1_3 = tree1.generateOperationUpdate('a', 'updatedByTree1');
  const op_1_4 = tree1.generateOperationMove('d', 'b');

  const op_2_3 = tree2.generateOperationUpdate('a', 'updatedByTree2');
  const op_2_4 = tree2.generateOperationMove('a', 'c');

  tree1.applyOperations([op_1_3, op_1_4]);
  tree2.applyOperations([op_2_3, op_2_4]);

  tree2.applyOperations([op_1_3, op_1_4]);
  tree1.applyOperations([op_2_3, op_2_4]);

  const op_1_5 = tree1.generateOperationDelete('b');

  const op_2_5 = tree2.generateOperationUpdate('b', 'updatedByTree2');

  tree1.applyOperations([op_1_5]);
  tree2.applyOperations([op_2_5]);

  tree2.applyOperations([op_1_5]);
  tree1.applyOperations([op_2_5]);

  tree1.clock.id = tree2.clock.id;

  expect(tree1).toMatchObject(tree2);
});

it('crdt tree 역직렬화', () => {
  const tree = new CrdtTree<string>('1');

  const op1 = tree.generateOperationAdd('a', 'root', 'hello');
  const op2 = tree.generateOperationAdd('b', 'root', 'hi');
  const op3 = tree.generateOperationAdd('c', 'root', 'good');
  const op4 = tree.generateOperationAdd('d', 'c', 'bad');

  tree.applyOperations([op1, op2, op3, op4]);

  expect(JSON.stringify(tree));

  const parsedTree = CrdtTree.parse<string>(JSON.stringify(tree));

  expect(JSON.stringify(tree)).toEqual(JSON.stringify(parsedTree));
});

it('crdt tree 순환', () => {
  const tree = new CrdtTree<string>('1');

  const op1 = tree.generateOperationAdd('a', 'root', 'hello');
  const op2 = tree.generateOperationAdd('b', 'root', 'hi');
  const op3 = tree.generateOperationAdd('c', 'a', 'good');
  const op4 = tree.generateOperationAdd('d', 'b', 'bad');
  const op5 = tree.generateOperationMove('a', 'b');
  const op6 = tree.generateOperationMove('b', 'a');

  tree.applyOperations([op1, op2, op3, op4, op5, op6]);

  expect(tree.tree.get('b').parentId).toEqual('root');
});
