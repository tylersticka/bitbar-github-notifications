const ghGot = require("gh-got");
const groupBy = require("lodash/groupBy");

async function expandThread(thread, options) {
  var { subject } = thread;
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

  thread.subject = subject;
  return thread;
}

async function getNotifications(options) {
  try {
    const { body } = await ghGot("notifications", { token: options.token });
    const notifications = await Promise.all(
      body.map(async (thread) => {
        const expanded = await expandThread(thread, options);
        return expanded;
      })
    );
    return notifications;
  } catch {
    return [];
  }
}

function groupByRepository(notifications) {
  const grouped = groupBy(notifications, (thread) => thread.repository.id);
  const repositories = Object.values(grouped).map((group) => {
    const { repository } = group[0];
    repository.threads = group;
    return repository;
  });
  return repositories;
}

module.exports = { getNotifications, groupByRepository };
