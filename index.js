const ghGot = require("gh-got");
const bitbar = require("bitbar");
const groupBy = require("lodash/groupBy");
const path = require("path");
const icons = require("./icons.json");

async function getNotifications(options) {
  const { body } = await ghGot("notifications", { token: options.token });
  const notifications = await Promise.all(
    body.map(async (item) => {
      const url = item.subject.latest_comment_url || item.subject.url;
      var html_url = url;

      try {
        const { body } = await ghGot(
          url.replace("https://api.github.com/", ""),
          {
            token: options.token,
          }
        );
        html_url = body.html_url;
      } catch (error) {
        html_url = url
          .replace(/api\./, "")
          .replace(/repos\//, "")
          .replace(/(pull|commit)s/, "$1");
      }

      item.subject.html_url = html_url;
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
  const item = {
    text: notification.subject.title,
    href: notification.subject.html_url,
    templateImage: icons["issue-opened"],
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
      text: `${count && count}`,
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
      bash: `node ${path.join(__dirname, "mark-as-read.js")} ${options.token}`,
      terminal: true,
    });
  }

  repositories.forEach((repository) => {
    items.push(...itemsFromRepository(repository));
  });

  bitbar(items);
}

module.exports = plugin;
