const minimist = require("minimist");
const bitbar = require("bitbar");
const { getIcons } = require("./lib/icons");
const { markAsRead } = require("./lib/mark-as-read");
const { getNotifications, groupByRepository } = require("./lib/notifications");

const defaults = {
  icon: "octoface",
};

const scriptBase = process.argv.slice(0, 2).join(" ");
const processArgs = minimist(process.argv.slice(2));

function getThreadIconName(thread) {
  const { type, user, merged, draft, state } = thread.subject;

  if (user && user.type === "Bot") {
    return "hubot";
  }

  if (type === "Commit") {
    return "git-commit";
  }

  if (type === "Issue") {
    return `issue-${state === "closed" ? state : "opened"}`;
  }

  if (type === "PullRequest") {
    if (merged) {
      return "git-merge";
    }

    if (draft) {
      return "pencil";
    }

    return "git-pull-request";
  }

  return "primitive-dot";
}

function getThreadText(thread) {
  const { subject } = thread;
  const { title, user } = subject;
  const segments = [title];

  if (user && user.login) {
    segments.push(`(${user.login})`);
  }

  return segments.join(" ");
}

async function plugin(options) {
  const settings = { ...defaults, ...options, ...processArgs };

  if (settings.action === "read") {
    return markAsRead(settings);
  }

  const icons = await getIcons();
  const items = [];
  var notifications = await getNotifications(settings);

  if (settings.filterData) {
    notifications = notifications.filter(settings.filterData);
  }

  const count = notifications.length;
  const barCount = count > 0 ? `${count}` : "";
  const inboxCount = count > 0 ? `(${count} unread)` : "";

  items.push(
    {
      text: barCount,
      templateImage: icons[settings.icon],
    },
    bitbar.separator,
    {
      text: "Refresh",
      refresh: true,
      templateImage: icons["cloud-download"],
    },
    {
      text: `Inbox ${inboxCount}`,
      href: "https://github.com/notifications",
      templateImage: icons["inbox"],
    }
  );

  if (count) {
    items.push({
      text: "Mark all as read",
      templateImage: icons["primitive-dot-stroke"],
      bash: scriptBase,
      param1: "--action=read",
      refresh: true,
      terminal: true,
    });

    const repositories = groupByRepository(notifications);
    repositories.forEach((repository) => {
      items.push(bitbar.separator, repository.full_name);
      repository.threads.forEach((thread) => {
        var item = {
          text: getThreadText(thread),
          href: thread.subject.html_url,
          templateImage: icons[getThreadIconName(thread)],
        };

        if (settings.modifyItem) {
          item = settings.modifyItem(item);
        }

        items.push(item);
      });
    });
  }

  bitbar(items);
}

module.exports = plugin;
