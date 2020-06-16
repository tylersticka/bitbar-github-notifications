const { separator } = require("bitbar");
const groupBy = require("lodash/groupBy");
const {
  getNotifications,
  getNotificationDetails,
  getHtmlUrlFromUrl,
} = require("./github");
const { getIcons } = require("./icons");

function getIconName(notification = {}, thread = {}) {
  const { subject } = notification;

  if (subject.type === "Commit") {
    return "git-commit";
  }

  if (subject.type === "Issue") {
    return `issue-${thread.state === "closed" ? thread.state : "opened"}`;
  }

  if (subject.type === "PullRequest") {
    if (thread.merged) {
      return "git-merge";
    }

    return "git-pull-request";
  }

  return "primitive-dot";
}

function formatItem(notification = {}, thread = {}, comment = {}, icons = {}) {
  const text = notification.subject.title;
  const href =
    (comment && comment.html_url) ||
    (thread && thread.html_url) ||
    notification.subject.html_url ||
    getHtmlUrlFromUrl((thread && thread.url) || notification.subject.url);
  const iconName = getIconName(notification, thread, comment);
  const templateImage = icons[iconName];

  return { text, href, templateImage };
}

async function getItems(options = {}) {
  const settings = options;
  const icons = await getIcons();
  const items = [];

  const notificationData = await getNotifications(settings);
  const notifications = await Promise.all(
    notificationData.map(async (notification) => {
      const { thread, comment } = await getNotificationDetails(
        notification,
        settings
      );
      const bitbar = formatItem(notification, thread, comment, icons);
      return { notification, thread, comment, bitbar };
    })
  );

  const count = notifications.length;
  const barCount = count > 0 ? `${count}` : "";
  const inboxCount = count > 0 ? `(${count} unread)` : "";

  items.push({
    text: barCount,
    templateImage: icons[settings.icon],
  }, separator, {
    text: "Refresh",
    refresh: true,
    templateImage: icons["sync"],
  }, {
    text: `Inbox ${inboxCount}`,
    href: settings.inboxHref,
    templateImage: icons["inbox"],
  });

  if (count > 0) {
    if (settings.group) {
      const grouped = groupBy(
        notifications,
        (item) => item.notification.repository.id
      );
      Object.values(grouped).forEach((group) => {
        const { repository } = group[0].notification;
        items.push(
          separator,
          repository.full_name,
          ...group.map((item) => item.bitbar)
        );
      });
    } else {
      items.push(
        separator,
        notifications.map((item) => item.bitbar)
      );
    }

    items.push(separator, {
      text: "Mark all notifications as read",
      templateImage: icons['check-circle'],
      bash: settings.scriptBase,
      param1: "--action=read",
      refresh: true,
      terminal: true,
    });
  }

  return items;
}

module.exports = { getItems };
