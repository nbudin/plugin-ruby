const net = require("net");
const prettier = require("prettier");

const { spawnSync } = require("child_process");

// eslint-disable-next-line no-underscore-dangle
const { formatAST } = prettier.__debug;

function parseAsync(parser, source) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.setTimeout(10 * 1000, () => {
      client.destroy();
      reject(new Error("Connection to the server timed out."));
    });

    client.on("error", (error) => {
      client.destroy();
      reject(error);
    });

    client.on("end", () => {
      client.destroy();
      reject(new Error("Server closed the connection."));
    });

    client.on("data", (data) => {
      client.destroy();

      const response = JSON.parse(data.toString());
      (response.error ? reject : resolve)(response);
    });

    client.connect(process.env.PRETTIER_RUBY_HOST, () => {
      client.end(`${parser}|${source}`);
    });
  });
}

function checkFormat(before, after, config) {
  const parser = before.parser || "ruby";
  const originalText = before.code || before;

  const opts = Object.assign({ parser, plugins: ["."], originalText }, config);

  if (
    opts.parser === "ruby" // &&
    // (originalText.includes("#") || originalText.includes("=begin"))
  ) {
    // If the source includes an #, then this test has a comment in it.
    // Unfortunately, formatAST expects comments to already be attached, but
    // prettier doesn't export anything that allows you to hook into their
    // attachComments function. So in this case, we need to instead go through
    // the normal format function and spawn a process.

    const doc = prettier.__debug.printToDoc(originalText, opts);
    const { stdout } = spawnSync("ruby", ["doc.rb"], { input: JSON.stringify(doc) });

    const expected = prettier.__debug.printDocToString(doc, { parser: "ruby", plugins: ["."] }).formatted;
    const actual = stdout.toString();

    return Promise.resolve({
      pass: expected === actual,
      message: () => `Expected:\n${expected}\nReceived:\n${actual}`
    });
  } else {
    return parseAsync(opts.parser, originalText)
      .then((ast) => formatAST(ast, opts).formatted)
      .then((formatted) => ({
        pass: formatted === `${after}\n`,
        message: () => `Expected:\n${after}\nReceived:\n${formatted}`
      }))
      .catch((error) => ({
        pass: false,
        message: () => error.message
      }));
  }
}

expect.extend({
  toChangeFormat(before, after, config = {}) {
    return checkFormat(before, after.code || after, config);
  },
  toMatchFormat(before, config = {}) {
    return checkFormat(before, before.code || before, config);
  }
});
