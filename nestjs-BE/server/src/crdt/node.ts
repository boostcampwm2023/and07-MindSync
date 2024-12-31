export class Node {
  targetId: string;
  parentId: string;
  description?: string;
  children = new Array<string>();

  constructor(
    targetId: string,
    parentId: string = '0',
    description: string = null,
  ) {
    this.targetId = targetId;
    this.parentId = parentId;
    this.description = description;
  }

  static parse(json: string) {
    const parsedJson = JSON.parse(json);
    const node = new Node(
      parsedJson.targetId,
      parsedJson.parentId,
      parsedJson.description,
    );
    node.children = parsedJson.children;
    return node;
  }
}
