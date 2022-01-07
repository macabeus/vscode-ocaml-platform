const { Position, SymbolKind, Range, commands } = vscode;

const waitForDocumentSymbols = async (uri) => {
  return await waitFor(async () => {
    const documentSymbols = await take.documentSymbols(uri);
    expect(documentSymbols).toHaveLength(1);
    return documentSymbols;
  });
};

describe("#Document Symbol", () => {
  it("includes function declaration", () => {
    return using(
      {
        files: {
          "foo.ml": 'let hello () = print_endline "hey there"',
        },
        mocks: {
          "window.showQuickPick": jest
            .fn()
            .mockImplementation(async (items) => {
              return items.find(
                ({ label }) => label === "vscode-ocaml-platform"
              );
            }),
        },
      },
      async (mapFileToUri) => {
        await commands.executeCommand("ocaml.select-sandbox");

        const symbols = await waitForDocumentSymbols(mapFileToUri["foo.ml"]);

        expect(symbols[0]).toMatchObject({
          name: "hello",
          detail: "unit -> unit",
          kind: SymbolKind.Function,
          location: {
            range: new Range(new Position(0, 0), new Position(0, 40)),
          },
          children: [],
        });
      }
    );
  });

  it("includes type definition", () => {
    return using(
      {
        files: {
          "bar.ml": "type foo = true",
        },
        mocks: {
          "window.showQuickPick": jest
            .fn()
            .mockImplementation(async (items) => {
              return items.find(
                ({ label }) => label === "vscode-ocaml-platform"
              );
            }),
        },
      },
      async (mapFileToUri) => {
        await commands.executeCommand("ocaml.select-sandbox");

        const symbols = await waitForDocumentSymbols(mapFileToUri["bar.ml"]);

        expect(symbols[0]).toMatchObject({
          name: "foo",
          detail: "",
          kind: SymbolKind.String,
          location: {
            range: new Range(new Position(0, 0), new Position(0, 15)),
          },
          children: [
            {
              name: "true",
              detail: "",
              kind: SymbolKind.Constructor,
              location: {
                range: new Range(new Position(0, 11), new Position(0, 15)),
              },
            },
          ],
        });
      }
    );
  });
});
