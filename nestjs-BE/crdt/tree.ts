import { Node } from './node';

export class Tree<T> {
  nodes = new Map<string, Node<T>>();
  children = new Map<string, Set<string>>();

  constructor() {
    this.nodes.set('root', new Node<T>());
  }

  get(id: string): Node<T> | undefined {
    return this.nodes.get(id);
  }

  addNode(targetId: string, parentId: string, content: T) {
    const newNode = new Node<T>(parentId, content);

    const parentNode = this.nodes.get(parentId);
    if (!parentNode) return;

    let childrenSet = this.children.get(parentId);
    if (!childrenSet) {
      childrenSet = new Set();
      this.children.set(parentId, childrenSet);
    }

    childrenSet.add(targetId);
    this.nodes.set(targetId, newNode);
  }

  attachNode(targetId: string, parentId: string) {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    const parentNode = this.nodes.get(parentId);
    if (!parentNode) return;

    let childrenSet = this.children.get(parentId);
    if (!childrenSet) {
      childrenSet = new Set();
      this.children.set(parentId, childrenSet);
    }

    childrenSet.add(targetId);
    targetNode.parentId = parentId;
  }

  removeNode(targetId: string): Node<T> {
    const targetNode = this.nodes.get(targetId);
    if (!targetNode) return;

    const parentChildren = this.children.get(targetNode.parentId);
    if (!parentChildren) return;
    parentChildren.delete(targetId);

    return this.nodes.get(targetId);
  }
}
