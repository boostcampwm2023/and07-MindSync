export class Node<T> {
  targetId: string;
  parentId: string;
  content: T;
  children = new Array<string>();

  constructor(
    targetId: string,
    parentId: string = '0',
    content: T | null = null,
  ) {
    this.targetId = targetId;
    this.parentId = parentId;
    this.content = content;
  }
}
