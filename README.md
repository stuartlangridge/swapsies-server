# the swapsies server

Very simple server for swapsies. A client, when it asks to pair, hits `/getcode?id=(uniqueid)`. This opens a long-running connection which will write lines to the connection. (This means that you have to be able to read an HTTP connection in progress, not just wait until the end.) Note that the `uniqueid` is the string which defines your "avatar".

`getcode` response lines will be the following:

 * `Code:1234\n` - this is the code that you display, and which others need to type in to pair with you.
 * `Seconds:9\n` - the server sends you one "keep-alive" per second which counts down to 1 and then the request closes
 * `Pair:(uniqueid)\n` - someone else entered your code, and this is _their_ `uniqueid` defining their avatar, which you now have.

To enter someone else's code in order to pair with them, hit `/sendcode?code=1234&id=(uniqueid)`. This will return JSON, either `{status: "ok", identifier: "(uniqueid)"}` or `{status: "badcode"}`.

## running in production

We use [forever](https://github.com/foreverjs/forever).

 * Start the server: `./node_modules/.bin/forever start index.js`. This will daemonise.
 * Check the server is up:`./node_modules/.bin/forever list`.
 * See where the logfiles are: `./node_modules/.bin/forever logs`. You can also pass `-l` to the forever start command to put the logs somewhere specific.
 * You can also pass `stop`, `stopall`, `restart` commands to `forever`. See the documentation.

