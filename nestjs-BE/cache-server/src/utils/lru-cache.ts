class LRUNode {
  key: string;
  value: any;
  prev: LRUNode | null;
  next: LRUNode | null;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export default class LRUCache {
  capacity: number;
  hashmap: { [key: string]: LRUNode };
  head: LRUNode;
  tail: LRUNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.hashmap = {};
    this.head = new LRUNode('0', 0);
    this.tail = new LRUNode('0', 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: string): any {
    if (this.hashmap[key]) {
      const node = this.hashmap[key];
      this.remove(node);
      this.add(node);
      return node.value;
    }
    return -1;
  }

  put(key: string, value: any): void {
    if (this.hashmap[key]) this.remove(this.hashmap[key]);

    const node = new LRUNode(key, value);
    this.add(node);
    this.hashmap[key] = node;
    if (Object.keys(this.hashmap).length > this.capacity) {
      const oldestNode = this.head.next;
      if (oldestNode) {
        this.remove(oldestNode);
        delete this.hashmap[oldestNode.key];
      }
    }
  }

  private remove(node: LRUNode): void {
    const prev = node.prev;
    const next = node.next;
    if (prev) prev.next = next;
    if (next) next.prev = prev;
  }

  private add(node: LRUNode): void {
    const prev = this.tail.prev;
    if (prev) prev.next = node;
    this.tail.prev = node;
    node.prev = prev;
    node.next = this.tail;
  }

  removeOldest(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.head.next !== this.tail) {
        const node = this.head.next;
        if (node) {
          this.remove(node);
          delete this.hashmap[node.key];
        }
      } else {
        break;
      }
    }
  }
}
