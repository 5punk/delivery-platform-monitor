//Load the library and specify options
const replace = require("replace-in-file");
const path = require("path");

const redactMapperFrom = [
  /['|"](.*)['|"](.*) \/\/ prevent-sensitive-commit-string/g,
  /\[([^\]]+)](.*) \/\/ prevent-sensitive-commit-array/gm
];

const redactMapperTo = [
  '""$2 // prevent-sensitive-commit-string',
  "[]$2 // prevent-sensitive-commit-array"
];

const redact = async () => {
  const options = {
    files: "./src/**/*.js",
    from: redactMapperFrom,
    to: redactMapperTo
  };

  try {
    const results = await replace(options);
    const changedFiles = results
      .filter(result => result.hasChanged)
      .map(result => result.file);

    console.log("Replacement results:", changedFiles);
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

redact();
