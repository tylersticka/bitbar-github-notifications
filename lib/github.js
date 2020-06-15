const ghGot = require("gh-got");

async function getNotifications(options) {
  try {
    const { body } = await ghGot("notifications", { token: options.token });
    return body;
  } catch {
    return [];
  }
}

async function getNotificationDetails(notification, options) {
  const { subject } = notification;
  const url = subject.url;
  const commentUrl = subject.latest_comment_url;
  const thread = await getNotificationDetail(url, options);
  const comment =
    commentUrl && (await getNotificationDetail(commentUrl, options));
  return { thread, comment };
}

async function getNotificationDetail(url, options) {
  const endpoint = url.replace(options.apiRoot, "");

  try {
    const { body } = await ghGot(endpoint, { token: options.token });
    return body;
  } catch {
    return {};
  }
}

async function getThreadFromNotification(notification, options) {
  const { subject } = notification;
  const url = subject.latest_comment_url || subject.url;
  const endpoint = url.replace(options.apiRoot, "");

  try {
    const { body } = await ghGot(endpoint, { token: options.token });
    return body;
  } catch {
    return {};
  }
}

function getHtmlUrlFromUrl(url) {
  return url
    .replace(/api\./, "")
    .replace(/repos\//, "")
    .replace(/(pull|commit)s/, "$1");
}

module.exports = {
  getNotifications,
  getNotificationDetails,
  getThreadFromNotification,
  getHtmlUrlFromUrl,
};
