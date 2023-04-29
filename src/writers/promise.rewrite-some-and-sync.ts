"use strict";

import { generageRandomJson } from "./tools/createRandomJsonTree";
import { parseCommandLineArgs } from "./tools/parseCommandLineArgs";
import {
  createDbList,
  deleteDbs,
  postDocsToLocalDbs,
  changeSomeDocsInDbs,
  measureSync,
} from "./tools/dbFunctionsWrappers";
import { ExpConfig, CommandLineConfig, CommandLineArgsConfig } from "./types";
import {
  distributeLocalDbsOverRemote,
  printSyncDurationList,
} from "./tools/tools";

(async function execute() {
  const config = parseCommandLineArgs(
    CommandLineArgsConfig
  ) as CommandLineConfig;

  const randomJson = generageRandomJson(config.json_size_bite, 10, 10);

  for (let i = 0; i < config.local_client_count.length; i++) {
    const local_client_count = config.local_client_count[i];
    const remote_client_count = config.remote_client_count[i];

    await tryToExecuteExp(
      { ...config, local_client_count, remote_client_count },
      randomJson
    );
  }
})();

async function tryToExecuteExp(
  {
    local_client_count,
    doc_count,
    remote_client_count,
    remote_server_path,
    local_db_directory_path,
    output_file,
    output_directory,
    rewriting_persentage,
    json_size_bite,
  }: ExpConfig,
  doc: any
) {
  let localDbs, remoteDbs;

  try {
    localDbs = createDbList({
      path: local_db_directory_path,
      count: local_client_count,
    });

    remoteDbs = createDbList({
      path: remote_server_path,
      count: remote_client_count,
    });

    const localToRemoteMap = distributeLocalDbsOverRemote(localDbs, remoteDbs);

    const listOfPostedDocsForEachDb = await postDocsToLocalDbs(
      localDbs,
      doc,
      doc_count
    );

    await measureSync(localToRemoteMap);

    const randomJson = generageRandomJson(json_size_bite, 10, 10);

    await changeSomeDocsInDbs(
      localDbs,
      listOfPostedDocsForEachDb,
      randomJson,
      rewriting_persentage || 0
    );

    const durationInMSec = await measureSync(localToRemoteMap);

    await printSyncDurationList(durationInMSec, output_directory, output_file);
  } catch (e) {
    console.log(e);
  } finally {
    if (localDbs && remoteDbs) {
      // await deleteDbs([...localDbs, ...remoteDbs]);
    }
  }
}
