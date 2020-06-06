# bitbar-github-notifications

WIP, probably not ready for use quite yet.

## Sample plugin file

Create wherever your Bitbar plugins are located...

```js
#!/usr/bin/env /path/to/your/node/executable

const plugin = require("path/to/bitbar-github-notifications");

plugin({
  token: "your GitHub token",
});
```

## Todos

- Build icons initially if they haven't been yet
- Add ability to filter results
- Add ability to mark individual threads as read
