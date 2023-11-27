import { Node } from './node';

export class Tree<T> {
  nodes = new Map<string, Node<T>>();

  constructor() {
    this.nodes.set('root', new Node<T>());
  }

  get(id: string): Node<T> | undefined {
    return this.nodes.get(id);
  }

  getNodeChildren(id: string): Array<string> | null {
    const node = this.get(id);
    if (!node) return null;

    const childrenArray = Array.from(node.children);
    childrenArray.sort();
    return childrenArray;
  }

  addNode(targetId: string, parentId: string, content: T) {
    const newNode = new Node<T>(parentId, content);

    const parentNode = this.nodes.get(parentId);
    if (!parentNode) return;

    parentNode.children.add(targetId);
    this.nodes.set(targetId, newNode);
  }

  attachNode(targetId: string, parentId: string) {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    const parentNode = this.nodes.get(parentId);
    if (!parentNode) return;

    parentNode.children.add(targetId);
    targetNode.parentId = parentId;
  }

  removeNode(targetId: string): Node<T> {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    const parentNode = this.nodes.get(targetNode.parentId);
    if (!parentNode) return;

    parentNode.children.delete(targetId);

    return this.nodes.get(targetId);
  }

  updateNode(targetId: string, content: T) {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    targetNode.content = content;
  }
}
