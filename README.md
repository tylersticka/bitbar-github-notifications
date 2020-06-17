# bitbar-github-notifications

An alternative to [the official BitBar GitHub notifications plugin](https://github.com/matryer/bitbar-plugins/blob/master/Dev/GitHub/notifications.30s.py), re-written in JavaScript because I understand it and wanted to make some opinionated changes.

## Prerequisites

To set up, you will need:

- [BitBar](https://getbitbar.com/)
- [Node.js](https://nodejs.org/en/) (12 or later)
- [A GitHub personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)
- The location of your BitBar plugin directory.
- The location of your Node executable (`which node`).

## Installation

1. Clone this repository somewhere on your Mac that you'll have permission to access from your BitBar plugin directory. Make note of the path.
1. Create a new `.js` file in your BitBar directory, following [BitBar's conventions for specifying the desired refresh time](https://github.com/matryer/bitbar#configure-the-refresh-time).
1. Populate the file with one of the below examples, taking care to update the following details:

- The path to your Node executable.
- The path to where you cloned this repository.
- Your access token.

## Example plugin

### Basic

```js
#!/usr/bin/env /path/to/your/node/executable

const plugin = require("path/to/bitbar-github-notifications");

plugin({
  token: "your GitHub token",
});
```

### With options

```js
#!/usr/bin/env /path/to/your/node/executable

const plugin = require("path/to/bitbar-github-notifications");

plugin({
  token: "your GitHub token",
  icon: "mark-github", // Use the GitHub favicon
  filter: (item) => {
    // Don't show PRs that bump dependency versions
    return !item.bitbar.text.includes("Bump");
  },
});
```

## Options

- `token` (required): Your GitHub personal access token.
- `icon`: The [octicon](https://primer.style/octicons/) to use for the menu bar icon. Default: [octoface](https://primer.style/octicons/octoface-16).
- `filter`: An optional callback function to filter results. Receives an object containing `bitbar` (data passed to [the bitbar package](https://github.com/sindresorhus/bitbar#usage)) as well as any API data received along the way (potentially `notification`, `thread` and `comment`). Return `false` to remove a notification from the listing. (Note that "mark all as read" will mark _all_ notifications as read, filtered or otherwise.)
- `group`: If true, notifications are grouped by repository. Default: `true`
- `apiRoot`: The GitHub API root path. Default: `https://api.github.com/`
- `inboxHref`: Location of the Notification inbox. Default: `https://github.com/notifications`
