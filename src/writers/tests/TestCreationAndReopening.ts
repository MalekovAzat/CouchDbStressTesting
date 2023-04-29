import PouchDB from "pouchdb-node";
import { generageRandomJson } from "../tools/createRandomJsonTree";

async function testCreationAndReopening() {
  const path = "./databases/id-10";

  const randomFile = generageRandomJson(8164, 10, 10);
  const docCountToWrite = 10;

  let db = new PouchDB(path);

  await Promise.all(
    Array(docCountToWrite)
      .fill(randomFile)
      .map((f) => db.post(f))
  );

  await db.close();

  db = new PouchDB(path);

  console.log(await db.info());
}

testCreationAndReopening();
