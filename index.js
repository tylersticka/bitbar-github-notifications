const minimist = require("minimist");
const bitbar = require("bitbar");
const { getItems } = require("./lib/items");
const { markAsRead } = require("./lib/mark-as-read");

const defaults = {
  icon: "octoface",
  apiRoot: "https://api.github.com/",
  group: true,
  inboxHref: "https://github.com/notifications",
  scriptBase: process.argv.slice(0, 2).join(" "),
};

const processArgs = minimist(process.argv.slice(2));

async function plugin(options) {
  const settings = { ...defaults, ...options, ...processArgs };

  if (settings.action === "read") {
    return markAsRead(settings);
  }

  const items = await getItems(settings);
  bitbar(items);
}

module.exports = plugin;
