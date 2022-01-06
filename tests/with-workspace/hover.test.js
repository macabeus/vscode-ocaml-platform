const { workspace, Position, commands } = vscode;

const waitForHovers = async (uri, position) => {
  return await waitFor(async () => {
    const hovers = await take.hovers(uri, position);
    expect(hovers).toHaveLength(1);
    return hovers;
  });
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
jest.setTimeout(9999_000);

describe("#Hover", () => {
  describe("on a function declaration", () => {
    it.only("shows the parameters and return types", () => {
      return using(
        {
          files: {
            "main.ml": 'let hello () = print_endline "hey there"',
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

          const hovers = await waitForHovers(
            mapFileToUri["main.ml"],
            new Position(0, 5)
          );

          expect(hovers).toEqual(["```ocaml\nunit -> unit\n```"]);

          await wait(2_000)
        }
      );
    });
  });

  describe("on a custom type reference", () => {
    it("shows the type definition", () => {
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

          const hovers = await waitForHovers(
            mapFileToUri["main.ml"],
            new Position(2, 10)
          );

          try {
            expect(hovers).toEqual([
              "```ocaml\ntype foo = { blah : string }\n```",
            ]);
          } catch {
            expect(hovers).toEqual([
              "```ocaml\ntype foo = { blah : string; }\n```",
            ]);
          }
        }
      );
    });
  });
});
