const ghGot = require("gh-got");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
var endpoint = "notifications";
var method = "PUT";

if (args.thread) {
  endpoint += `/threads/${args.thread}`;
  method = "PATCH";
}

(async () => {
  await ghGot(endpoint, {
    token: args.token,
    method: method,
  });
})();
