//Load the library and specify options
const replace = require("replace-in-file");
const fs = require("fs");

const beforeDelta = {};

const saveBefore = (file, reg) => {
  if (!beforeDelta[file]) {
    beforeDelta[file] = fs.readFileSync(file);
  }
  return reg;
};

const redactMapperFrom = [
  file =>
    saveBefore(
      file,
      /['|"](.*)['|"](.*) \/\/ prevent-sensitive-commit-string/g
    ),
  file =>
    saveBefore(file, /\[([^\]]+)](.*) \/\/ prevent-sensitive-commit-array/gm)
];
const redactMapperTo = [
  '""$2 // prevent-sensitive-commit-string',
  "[]$2 // prevent-sensitive-commit-array"
];

const redact = async () => {
  const options = {
    files: "./src/**/*.js",
    from: redactMapperFrom,
    to: redactMapperTo,
    verbose: true
  };

  try {
    const results = await replace(options);
    const changedFiles = results.filter(result => result.hasChanged);
    const deltas = changedFiles.map(({ file }) => ({
      file,
      data: beforeDelta[file].toString()
    }));
    deltas.forEach(({ file, data }) => {
      console.log("===============");
      console.log(file);
      console.log("---------------");
      console.log(data);
      console.log("===============");
    });

    console.log("Replacement results:", changedFiles);
    console.log("===============");
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

redact();
