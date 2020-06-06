const ghGot = require("gh-got");
const bitbar = require("bitbar");
const groupBy = require("lodash/groupBy");
const path = require("path");
const icons = require("./icons.json");

async function getNotifications(options) {
  const { body } = await ghGot("notifications", { token: options.token });
  const notifications = await Promise.all(
    body.map(async (item) => {
      var { subject } = item;
      const url = subject.latest_comment_url || subject.url;
      const endpoint = url.replace("https://api.github.com/", "");

      try {
        const { body } = await ghGot(endpoint, {
          token: options.token,
        });
        subject = { ...subject, ...body };
      } catch (error) {
        subject.html_url = url
          .replace(/api\./, "")
          .replace(/repos\//, "")
          .replace(/(pull|commit)s/, "$1");
      }

      item.subject = subject;
      return item;
    })
  );
  return notifications;
}

function groupByRepository(notifications) {
  const grouped = groupBy(
    notifications,
    (notification) => notification.repository.id
  );
  const repositories = Object.values(grouped).map((group) => {
    const { repository } = group[0];
    repository.notifications = group;
    return repository;
  });
  return repositories;
}

function itemFromNotification(notification) {
  const { subject } = notification;
  const { title, type, html_url, user, merged, draft, state } = subject;
  var icon = icons["primitive-dot"];

  if (user && user.type === "Bot") {
    icon = icons["hubot"];
  } else if (type === "Issue") {
    if (state === "closed") {
      icon = icons["issue-closed"];
    } else {
      icon = icons["issue-opened"];
    }
  } else if (type === "PullRequest") {
    if (merged) {
      icon = icons["git-merge"];
    } else if (draft) {
      icon = icons["pencil"];
    } else {
      icon = icons["git-pull-request"];
    }
  }

  const item = {
    text: title,
    href: html_url,
    templateImage: icon,
  };

  return item;
}

function alternateItemFromNotification(notification) {
  const { subject, id } = notification;
  const { title } = subject;

  const item = {
    text: `Mark Read: ${title}`,
    templateImage: icons["check"],
    bash: `node ${path.join(__dirname, "mark-as-read.js")} --token=${
      options.token
    } --thread=${id}`,
    terminal: true,
    refresh: true,
    alternate: true,
  };

  return item;
}

function itemsFromRepository(repository) {
  return [
    bitbar.separator,
    repository.full_name,
    ...repository.notifications.map(itemFromNotification),
  ];
}

async function plugin(options) {
  const notifications = await getNotifications(options);
  const count = notifications.length;
  const repositories = groupByRepository(notifications);
  const items = [
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
    },
  ];

  if (count) {
    items.push({
      text: "Mark all as read",
      templateImage: icons["mail-read"],
      bash: `node ${path.join(__dirname, "mark-as-read.js")} --token=${
        options.token
      }`,
      terminal: true,
      refresh: true,
    });
  }

  repositories.forEach((repository) => {
    items.push(...itemsFromRepository(repository));
  });

  bitbar(items);
}

module.exports = plugin;
