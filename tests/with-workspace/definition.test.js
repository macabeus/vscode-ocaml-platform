const { Position, Range, commands, workspace } = vscode;

const waitForDefinitions = async (uri, position) => {
  return await waitFor(async () => {
    const definitions = await take.definitions(uri, position);
    expect(definitions).toHaveLength(1);
    return definitions;
  });
};

describe.skip("#Definition", () => {
  describe("on a function call", () => {
    it("go to the function declaration", () => {
      return using(
        {
          files: {
            "main.ml": dedent(`
              let hello () = print_endline "hey there"

              let call_hello () = hello
            `),
          },
          mocks: {
            "window.showQuickPick": jest
              .fn()
              .mockImplementation(async (items) => {
                return items.find(({ label }) => label === "default");
              }),
          },
        },
        async (mapFileToUri) => {
          await commands.executeCommand("ocaml.select-sandbox");

          const definitions = await waitForDefinitions(
            mapFileToUri["main.ml"],
            new Position(2, 22)
          );

          expect(definitions[0]).toMatchObject({
            range: new Range(new Position(0, 4), new Position(0, 4)),
          });
        }
      );
    });
  });

  describe("on a type reference", () => {
    it("go to the type declaration", () => {
      return using(
        {
          files: {
            "main.ml": dedent(`
              type foo = { blah : string }

              type t = foo
            `),
          },
          mocks: {
            "window.showQuickPick": jest
              .fn()
              .mockImplementation(async (items) => {
                return items.find(({ label }) => label === "default");
              }),
          },
        },
        async (mapFileToUri) => {
          await commands.executeCommand("ocaml.select-sandbox");

          const definitions = await waitForDefinitions(
            mapFileToUri["main.ml"],
            new Position(2, 11)
          );

          expect(definitions[0]).toMatchObject({
            range: new Range(new Position(0, 0), new Position(0, 0)),
          });
        }
      );
    });
  });
});
