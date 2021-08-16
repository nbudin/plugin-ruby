const { ruby } = require("../utils");

describe("embed", () => {
  test("ignores parsers it can't find", () => {
    const content = ruby(`
      <<-JAVA
      int i=0;
      JAVA
    `);

    return expect(content).toMatchFormat();
  });

  test("formats correctly on straight heredocs", () => {
    const content = ruby(`
      <<-JS.squish
      const a=1;
      const b=2;
      return a+b;
      JS
    `);

    const expected = ruby(`
      <<-JS.squish
      const a = 1;
      const b = 2;
      return a + b;
      JS
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("formats correctly on squiggly heredocs", () => {
    const content = ruby(`
      <<~JS.squish
        const a=1;
        const b=2;
        return a+b;
      JS
    `);

    const expected = ruby(`
      <<~JS.squish
        const a = 1;
        const b = 2;
        return a + b;
      JS
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("does not format if the heredoc has an interpolation", () => {
    const content = ruby(`
      <<~JS.squish
        const a=1;
        const b=#{2};
        return a+b;
      JS
    `);

    return expect(content).toMatchFormat();
  });

  test("removes whitespace so embedded parsers don't misinterpret", () => {
    const content = ruby(`
      <<~MARKDOWN
          foo
      MARKDOWN
    `);

    const expected = ruby(`
      <<~MARKDOWN
        foo
      MARKDOWN
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("keeps parent indentation", () => {
    const content = ruby(`
      some_block do
        another_block do
          x += 1
          description <<~JS
            // This is a DSL method on the another_block inner block.
            // This is another line of the string.
          JS
        end
      end
    `);

    return expect(content).toMatchFormat();
  });

  test("doesn't consider empty lines as part of the common leading whitespace", () => {
    const content = ruby(`
      some_block do
        x += 1
        description <<~MARKDOWN
          This is a line. It's followed by two literal line breaks.

          This is another line of the string.
        MARKDOWN
      end
    `);

    return expect(content).toMatchFormat();
  });
});
