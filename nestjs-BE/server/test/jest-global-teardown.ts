export default async function () {
  await globalThis.mongodb.stop();
  await globalThis.localstack.stop();
  await globalThis.mysql.stop();
}
