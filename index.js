const minimist = require("minimist");
const bitbar = require("bitbar");
const { getItems } = require("./lib/items");
// const { markAsRead } = require("./lib/mark-as-read");

const defaults = {
  icon: "octoface",
  apiRoot: "https://api.github.com/",
  group: true,
  inboxHref: "https://github.com/notifications",
};

// const scriptBase = process.argv.slice(0, 2).join(" ");
const processArgs = minimist(process.argv.slice(2));

async function plugin(options) {
  const settings = { ...defaults, ...options, ...processArgs };
  const items = await getItems(settings);
  bitbar(items);

  // if (count) {
  //   items.push({
  //     text: "Mark all as read",
  //     templateImage: icons["primitive-dot-stroke"],
  //     bash: scriptBase,
  //     param1: "--action=read",
  //     refresh: true,
  //     terminal: false,
  //   });
  // }
}

module.exports = plugin;
