const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const chalk = require("chalk");

const { fsLogger, logPath } = require("../config/logger");

fsLogger && mkdirp(logPath);

// For todays date;
Date.prototype.today = function() {
  return (
    (this.getDate() < 10 ? "0" : "") +
    this.getDate() +
    "/" +
    (this.getMonth() + 1 < 10 ? "0" : "") +
    (this.getMonth() + 1) +
    "/" +
    this.getFullYear()
  );
};

// For the time now
Date.prototype.timeNow = function() {
  return (
    (this.getHours() < 10 ? "0" : "") +
    this.getHours() +
    ":" +
    (this.getMinutes() < 10 ? "0" : "") +
    this.getMinutes() +
    ":" +
    (this.getSeconds() < 10 ? "0" : "") +
    this.getSeconds()
  );
};

const ts = () => new Date().today() + " " + new Date().timeNow();

const log = async (tag, ...body) => {
  console.log(chalk.cyan(tag, ...body));
  fsLogger &&
    (await fs.appendFileSync(
      path.resolve(`${logPath}/log.log`),
      `${ts()} | ${tag} | ${JSON.stringify(body)}\n`
    ));
};

const info = async (tag, ...body) => {
  console.log(chalk.green(tag, ...body));
  fsLogger &&
    (await fs.appendFileSync(
      path.resolve(`${logPath}/info.log`),
      `${ts()} | ${tag} | ${JSON.stringify(body)}\n`
    ));
};

const warn = async (tag, ...body) => {
  console.warn(chalk.yellow(tag, ...body));
  fsLogger &&
    (await fs.appendFileSync(
      path.resolve(`${logPath}/warn.log`),
      `${ts()} | ${tag} | ${JSON.stringify(body)}\n`
    ));
};

const error = async (tag, ...body) => {
  console.error(chalk.red(tag, ...body));
  const msgBody = `${ts()} | ${tag} | ${JSON.stringify(body)}`;

  global.track.event("LOGGER", "ERROR", msgBody);

  fsLogger &&
    (await fs.appendFileSync(
      path.resolve(`${logPath}/error.log`),
      `${msgBody}\n`
    ));
};

const fatal = async (tag, ...body) => {
  console.trace(chalk.redBright(tag, ...body));
  fsLogger &&
    (await fs.appendFileSync(
      path.resolve(`${logPath}/fatal.log`),
      `${ts()} | ${tag} | ${JSON.stringify(body)}\n`
    ));
};

module.exports = {
  log,
  info,
  warn,
  error,
  fatal
};
