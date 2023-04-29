"use strict";

const fetch = require("node-fetch");

// keyCloach credentials example
const example_credentials = {
  username: "azat",
  password: "11",
  grant_type: "password",
  client_id: "myclient",
  client_secret: "JAOthJz7WIhrCOzzLG2OFl5b1FzISBdz",
};

const tokenEndpoint =
  "http://localhost:8080/realms/myrealm/protocol/openid-connect/token";

function constructFormBody(keyValueObject) {
  let formBody = [];

  for (let prop in keyValueObject) {
    const encodedKey = encodeURIComponent(prop);
    const encodeValue = encodeURIComponent(keyValueObject[prop]);
    formBody.push(encodedKey + "=" + encodeValue);
  }

  formBody = formBody.join("&");
  return formBody;
}

function kcToken(host = tokenEndpoint, credentials = example_credentials) {
  return new fetch(host, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: constructFormBody(credentials),
  })
    .then((res) => res.json())
    .then((body) => body.access_token)
    .catch((e) => e);
}

exports = {
  kcToken,
};

module.exports = {
  kcToken,
};
