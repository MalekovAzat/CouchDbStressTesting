"use strict";

let uuid = require("uuid");

function generageRandomJson(size, height, countInArray) {
  const action = ["addString", "addArray", "addLayer"];
  const stringBytesSize = 8 * 36;

  const threeHeight = height;
  const itemMaxCount = Math.floor(size / stringBytesSize); // 10mb / 36

  const valuesInArray = countInArray;

  const object = {};

  const arrayByLength = [];
  let itemCount = 0;

  for (let i = 0; i < threeHeight; i++) {
    arrayByLength.push([]);
    if (i == 0) {
      let pName = uuid.v4();
      let newObj = {};
      object[pName] = newObj;
      arrayByLength[0].push(newObj);
    } else {
      let pName = uuid.v4();
      let newObj = {};
      arrayByLength[i - 1][0][pName] = newObj;
      arrayByLength[i].push(newObj);
    }
    itemCount++;
  }

  while (itemCount <= itemMaxCount) {
    let level = Math.floor(Math.random() * (threeHeight - 1));
    let item = Math.floor(Math.random() * arrayByLength[level].length);
    let what = action[Math.floor(Math.random() * action.length)];

    const pName = uuid.v4();
    itemCount++;

    if (what == "addString") {
      const insertKey = uuid.v4();
      arrayByLength[level][item][pName] = insertKey;
      itemCount++;
    } else if (what == "addArray") {
      const sizeOfArray = Math.floor(Math.random() * valuesInArray);
      itemCount += sizeOfArray;
      const arr = [];
      for (let i = 0; i < sizeOfArray; i++) {
        arr.push(uuid.v4());
      }
      arrayByLength[level][item][pName] = arr;
    } else if (what == "addLayer") {
      const obj = {};
      arrayByLength[level][item][pName] = obj;
      arrayByLength[level + 1].push(obj);
    }
  }

  return object;
}

module.exports = {
  generageRandomJson,
};

exports = {
  generageRandomJson,
};
