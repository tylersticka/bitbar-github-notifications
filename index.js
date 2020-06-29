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
    console.log("Marking notifications as read...");
    console.log("\n");
    try {
      await markAsRead(settings);
      console.log("Done! You can close this now.");
    } catch (err) {
      console.log(err);
    }
    return;
  }

  const items = await getItems(settings);
  bitbar(items);
}

module.exports = plugin;
