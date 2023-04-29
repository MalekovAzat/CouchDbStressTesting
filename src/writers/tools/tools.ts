import { appendFile, opendir, access, mkdir, constants } from "fs/promises";
import PouchDB from "pouchdb-node";
import { join, dirname } from "path";
export async function printSyncDurationList(
  list: number[],
  directory: string,
  fileName: string
) {
  const path = join(directory, fileName);

  try {
    await access(path, constants.W_OK);
  } catch {
    await mkdir(dirname(path), { recursive: true });
  } finally {
    await appendFile(path, list.join(", ") + "\n");
  }
}

export function calcDurationInMSec(start: [number, number]) {
  const duration = process.hrtime(start);

  return duration[0] * 1e3 + duration[1] / 1e6;
}

export function distributeLocalDbsOverRemote(
  localDbs: PouchDB.Database<{}>[],
  remoteDbs: PouchDB.Database<{}>[]
) {
  const [lCount, rCount] = [localDbs.length, remoteDbs.length];

  if (lCount % rCount !== 0) {
    throw new Error(
      "The number of local databases must be a multiple of the number of remote ones"
    );
  }

  const localCountPerRemote = localDbs.length / remoteDbs.length;

  const localDbsToRemote = [];

  for (let i = 0; i < rCount; i++)
    localDbsToRemote.push({
      localDbs: localDbs.slice(
        i * localCountPerRemote,
        (i + 1) * localCountPerRemote
      ),
      remoteDb: remoteDbs[i],
    });

  return localDbsToRemote;
}

export async function pause(msec: number) {
  return new Promise((resolve, reject) => setTimeout(resolve, msec));
}
