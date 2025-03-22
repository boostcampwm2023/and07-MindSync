export default async function () {
  await globalThis.mongodb.stop();
}
