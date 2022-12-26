function readArgs() {
  const configObject = {
    remote: "http://localhost:5984/empty",
    count: 1, // count of documents to write
    json_size: 8 * 100 * 1024, // 10kb
    json_height: 10,
    json_arr_size: 10,
    batch_size: 10000, // count of documents to sync per request
  };

  let argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    configObject[argv[i].slice(2)] = Number(argv[i + 1]) || argv[i + 1];
  }
  return configObject;
}

exports = {
  readArgs,
};

module.exports = {
  readArgs,
};
