let uuid = require("uuid");
let PouchDB = require("pouchdb");
const fetch = require("node-fetch");

let remoteDb = new PouchDB("http://127.0.0.1:5984/empty", {
  fetch: (url, opts) => {
    let token =
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3LWJMUUVIU2dyMmp2QmR4MGhSb0R0R0otTnlLVkUxdkd0ZVZmR0ZJaUM0In0.eyJleHAiOjE2NjU1NjE4NTgsImlhdCI6MTY2NTU2MTU1OCwianRpIjoiNWQyYzdmNjktYjQ3My00NjkwLThkODYtYjc4MDUyZWNkZDIwIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9teXJlYWxtIiwic3ViIjoiZWFlY2E1NTItZGE5MS00ODI0LTk5MGYtOGFhNmQ3ZWZkN2EyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibXljbGllbnQiLCJzZXNzaW9uX3N0YXRlIjoiZTRkNDU1OTQtNmUxOC00YzZmLTgxZjEtN2ZjM2VlZDg2YmY4IiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwic2NvcGUiOiJlbWFpbCBjb3VjaGRiLXJvbGVzIG1pY3JvcHJvZmlsZS1qd3QgcHJvZmlsZSIsInNpZCI6ImU0ZDQ1NTk0LTZlMTgtNGM2Zi04MWYxLTdmYzNlZWQ4NmJmOCIsInVwbiI6ImF6YXQiLCJjb3VjaGRicm9sZXMiOlsiZGV2ZWxvcG1lbnQiXSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoi0JDQt9Cw0YIg0JzQsNC70LXQutC-0LIiLCJncm91cHMiOlsiZGVmYXVsdC1yb2xlcy1teXJlYWxtIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhemF0IiwiZ2l2ZW5fbmFtZSI6ItCQ0LfQsNGCIiwiZmFtaWx5X25hbWUiOiLQnNCw0LvQtdC60L7QsiIsImVtYWlsIjoibWFsZWtvdmF6YXRAZ21haWwuY29tIn0.iTL0t90b1qAZOd3yhWDLsOKguds55LhKT9-Sjh5fHY846cJd0Ye0JgUV14EkrcNTkFtN-NbF4nyoQe-ehkxVFMGugk4HqWV6NF0WFJjwyeQHhbAUMbgQnZQsogwb0boL_guuMpYgk46CNhJJVdgNU5Hr6pN8hyS6mVgrx2o5F8giZnOt2GmXkuLJ5l-V264avPo6WYt4lAsPSlElCYTihnj8HJ8KpT6KzJQwargxT-xm36VOk5TezTpJRXNS5XnJs6r-Ph5WBPc-UFCKdoj3MKhXwfpjk5C5lTIfCT3nWZBZqhsxg8-pBVfAAL0Y9D1Mg3BO9bneRhXY84MXsDXRIA";

    opts.headers.set("Authorization", `Bearer ${token}`);

    return PouchDB.fetch(url, opts);
  },
});

let configObject = {
  username: "azat",
  password: "11",
  grant_type: "password",
  client_id: "myclient",
  client_secret: "9BK73yWkOfj1mFpHS2EkIqMXMfppqdeQ",
};

let formBody = [];
for (let prop in configObject) {
  const encodedKey = encodeURIComponent(prop);
  const encodeValue = encodeURIComponent(configObject[prop]);
  formBody.push(encodedKey + "=" + encodeValue);
}
formBody = formBody.join("&");

fetch("http://localhost:8080/realms/myrealm/protocol/openid-connect/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  },
  body: formBody,
})
  .then((res) => res.json())
  .then(console.log)
  .catch(console.error);

// remoteDb
//   .info()
//   .then(function (result) {
//     console.log("!@#12", result);
//   })
//   .catch(function (err) {
//     console.log("!@#11", err);
//   });
