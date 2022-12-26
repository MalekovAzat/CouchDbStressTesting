"use strict";
// arguments of command line
// --remote : remote db name
// --count : count of documents
// --json_size
// --json_height
// --json_arr_size
// --batch_size

const uuid = require("uuid");
const PouchDb = require("pouchdb-node");

const { generageRandomJson } = require("./createRandomJsonTree");
const { kcToken } = require("./KeyCloakToken");
const { readArgs } = require("./getCommandLineArguments");
const path = require("path");

const conf = readArgs();
writeToRemoteDb(conf);

function writeToRemoteDb({
  remote,
  count,
  json_size,
  json_height,
  json_arr_size,
  batch_size,
}) {
  // console.log(path.join(__dirname, "databases", uuid.v4()));
  const localDb = PouchDb(path.join(__dirname, "databases", uuid.v4()));
  let remoteDb;

  kcToken()
    .then((token) => {
      remoteDb = PouchDb(remote, {
        fetch: (url, opts) => {
          opts.headers.set("Authorization", `Bearer ${token}`);

          return PouchDb.fetch(url, opts);
        },
      });

      const data = generageRandomJson(json_size, json_height, json_arr_size);
      // console.log("Data created");

      return postDataToLocalDb(localDb, count, data);
    })
    .then(() => sync(localDb, remoteDb, batch_size));
}

function postDataToLocalDb(localDb, count, obj) {
  return new Promise((resolve, reject) => {
    let promises = [];

    for (let i = 0; i < count; i++) {
      promises.push(localDb.post(obj));
    }

    Promise.all(promises)
      .then((result) => {
        resolve(result);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

function sync(localDb, remoteDb, batchSize) {
  return new Promise((resolve, reject) => {
    const hrstart = process.hrtime();
    // PouchDb.sync(localDb, remoteDb)
    //   .on("complete", (info) => {
    //     console.timeEnd("Sync time");
    //     resolve(info);
    //   })
    //   .on("error", (error) => reject(error));

    localDb.replicate
      .to(remoteDb, { batch_size: batchSize })
      .on("complete", (info) => {
        let hrend = process.hrtime(hrstart);
        console.log(hrend[0] * 1000 + hrend[1] / 1000000);
        resolve();
      })
      .on("error", (error) => {
        // console.log("Replication error", error);
        reject(error);
      });
  });
}
