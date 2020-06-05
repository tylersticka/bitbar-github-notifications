const ghGot = require("gh-got");

const token = process.argv.pop();

(async () => {
  await ghGot("notifications", {
    token: token,
    method: "PUT",
  });
})();
