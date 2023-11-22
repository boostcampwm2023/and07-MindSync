export class Node<T> {
  parentId: string;
  content: T;

  constructor(parentId: string = '0', content: T | null = null) {
    this.parentId = parentId;
    this.content = content;
  }
}
