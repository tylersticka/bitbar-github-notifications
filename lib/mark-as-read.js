const ghGot = require("gh-got");

function markAsRead(options) {
  const { thread, token } = options;
  var endpoint = "notifications";
  var method = "PUT";

  if (thread) {
    endpoint += `/threads/${thread}`;
    method = "PATCH";
  }

  return ghGot(endpoint, { method, token });
}

module.exports = { markAsRead };
