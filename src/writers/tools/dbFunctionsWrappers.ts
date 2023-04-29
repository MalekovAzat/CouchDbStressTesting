import { v4 as uuidv4 } from "uuid";
import PouchDB from "pouchdb-node";
import { calcDurationInMSec } from "./tools";
import { join } from "path";

interface CouchDbCreateConfig {
  path: String;
  globalPath?: String;
  count: number;
}

export function createLocalAndRemoteDbs({
  local,
  remote,
}: {
  local: CouchDbCreateConfig;
  remote: CouchDbCreateConfig;
}): {
  localDbs: PouchDB.Database<{}>[];
  remoteDbs: PouchDB.Database<{}>[];
} {
  const localDbs = createDbList(local);

  const remoteDbs = createDbList(remote);

  return { localDbs, remoteDbs };
}

export function createDbList({
  path,
  count,
}: CouchDbCreateConfig): PouchDB.Database<{}>[] {
  const dbIds = Array(count)
    .fill(0)
    .map(() => "id-" + uuidv4());

  const dbs = dbIds.map((id) => new PouchDB(path + id));

  return dbs;
}

export async function measureWritingToLocalDbsAndSyncing(
  localToRemoteMap: {
    localDbs: PouchDB.Database<{}>[];
    remoteDb: PouchDB.Database<{}>;
  }[],
  doc: any,
  doc_count: number
) {
  const hrstart = process.hrtime();

  const timings = await Promise.all(
    localToRemoteMap.map(({ localDbs, remoteDb }) =>
      measureWritingAndSyncinglocaldbsAndRemote(
        localDbs,
        remoteDb,
        doc,
        doc_count,
        hrstart
      )
    )
  );

  return timings.flat();
}

export async function measureWritingAndSyncinglocaldbsAndRemote(
  localDbs: PouchDB.Database<{}>[],
  remoteDb: PouchDB.Database<{}>,
  doc: any,
  doc_count: number,
  startMoment: [number, number]
) {
  return Promise.all(
    localDbs.map((localDb) =>
      measureWriteAndSync(localDb, remoteDb, doc, doc_count, startMoment)
    )
  );
}

export async function measureWriteAndSync(
  localDb: PouchDB.Database<{}>,
  remoteDb: PouchDB.Database<{}>,
  doc: any,
  doc_count: number,
  startMoment: [number, number]
) {
  await postToDb(localDb, doc, doc_count);
  await sync(localDb, remoteDb);

  return calcDurationInMSec(startMoment);
}

async function postToDb(db: PouchDB.Database<{}>, doc: any, doc_count: number) {
  return Promise.all(
    Array(doc_count)
      .fill(0)
      .map((_) => db.post(doc).then(({ id, rev }) => ({ id, rev })))
  );
}

async function sync(local: PouchDB.Database<{}>, remote: PouchDB.Database<{}>) {
  return new Promise((resolve, reject) => {
    local.replicate.to(remote).on("complete", resolve).on("error", reject);
  });
}

export async function deleteDbs(dbs: PouchDB.Database<{}>[]) {
  return Promise.all(dbs.map((db) => db.destroy()));
}

export async function postDocsToLocalDbs(
  localDbs: PouchDB.Database<{}>[],
  doc: any,
  doc_count: number
) {
  return Promise.all(localDbs.map((db) => postToDb(db, doc, doc_count)));
}

export async function measureSync(
  localToRemoteMap: {
    localDbs: PouchDB.Database<{}>[];
    remoteDb: PouchDB.Database<{}>;
  }[]
) {
  const hrstart = process.hrtime();

  const timings = await Promise.all(
    localToRemoteMap.map(({ localDbs, remoteDb }) =>
      measureSyncLocalsWithRemote(localDbs, remoteDb, hrstart)
    )
  );

  return timings.flat();
}

async function measureSyncLocalsWithRemote(
  localDbs: PouchDB.Database<{}>[],
  remoteDb: PouchDB.Database<{}>,
  startMoment: [number, number]
) {
  return Promise.all(
    localDbs.map((localDb) =>
      measureSyncLocalWithRemote(localDb, remoteDb, startMoment)
    )
  );
}

async function measureSyncLocalWithRemote(
  localDb: PouchDB.Database<{}>,
  remoteDb: PouchDB.Database<{}>,
  startMoment: [number, number]
): Promise<number> {
  return new Promise((resolve, reject) => {
    localDb.replicate
      .to(remoteDb)
      .on("complete", (res) => {
        const durationInMSec = calcDurationInMSec(startMoment);

        resolve(durationInMSec);
      })
      .on("error", reject);
  });
}

export async function changeSomeDocsInDbs(
  localDbs: PouchDB.Database<{}>[],
  listOfPostedDocsForEachDb: {
    id: string;
    rev: string;
  }[][],
  newDoc: any,
  rewriting_persentage: number
) {
  return Promise.all(
    localDbs.map((db, index) =>
      changeDocsInDb(
        db,
        listOfPostedDocsForEachDb[index],
        newDoc,
        rewriting_persentage
      )
    )
  );
}

async function changeDocsInDb(
  db: PouchDB.Database<{}>,
  listOfPostedDocs: {
    id: string;
    rev: string;
  }[],
  newDoc: any,
  rewriting_persentage: number
) {
  const promises = [];
  for (let i = 0; i < listOfPostedDocs.length; i++) {
    const change = Math.random() < rewriting_persentage;
    if (change) promises.push(changeDocInDb(db, listOfPostedDocs[i], newDoc));
  }
}

async function changeDocInDb(
  db: PouchDB.Database<{}>,
  oldDoc: {
    id: string;
    rev: string;
  },
  newDoc: any
) {
  return db.put({ _id: oldDoc.id, _rev: oldDoc.rev, ...newDoc });
}
