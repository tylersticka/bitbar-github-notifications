// const ghGot = require("gh-got");
const minimist = require("minimist");
const bitbar = require("bitbar");
const { getNotifications, groupByRepository } = require("./lib/notifications");
const { getIcons } = require("./lib/icons");
const { markAsRead } = require("./lib/mark-as-read");

const scriptBase = process.argv.slice(0, 2).join(" ");
const processArgs = minimist(process.argv.slice(2));

function threadIcon(thread) {
  const { type, user, merged, draft, state } = thread.subject;

  if (user && user.type === "Bot") {
    return "hubot";
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

async function plugin(options) {
  const settings = { ...options, ...processArgs };
  const icons = await getIcons();
  const items = [];

  if (settings.action === "read") {
    await markAsRead(settings);
    // try {
    //   await markAsRead(settings);
    // } catch {}
  }

  var notifications = await getNotifications(settings);

  if (settings.filterData) {
    notifications = notifications.map(settings.filterData);
  }

  const count = notifications.length;
  items.push(
    {
      text: count > 0 ? `${count}` : "",
      templateImage: icons["octoface"],
    },
    bitbar.separator,
    {
      text: "Refresh",
      refresh: true,
      templateImage: icons["cloud-download"],
    },
    {
      text: `Inbox (${count} unread)`,
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
      terminal: false,
    });

    const repositories = groupByRepository(notifications);
    repositories.forEach((repository) => {
      items.push(bitbar.separator, repository.full_name);
      repository.threads.forEach((thread) => {
        const { subject } = thread;
        const { id, title, html_url } = subject;
        const iconName = threadIcon(thread);
        items.push(
          {
            text: title,
            href: html_url,
            templateImage: icons[iconName],
          },
          {
            alternate: true,
            text: `Mark as read: ${title}`,
            templateImage: icons["primitive-dot-stroke"],
            bash: scriptBase,
            param1: "--action=read",
            param2: `--thread=${id}`,
            refresh: true,
            terminal: true,
          }
        );
      });
    });
  }

  bitbar(items);
}

module.exports = plugin;
