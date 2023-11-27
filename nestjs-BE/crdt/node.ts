export class Node<T> {
  parentId: string;
  content: T;
  children = new Set<string>();

  constructor(parentId: string = '0', content: T | null = null) {
    this.parentId = parentId;
    this.content = content;
  }
}
