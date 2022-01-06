const { workspace } = vscode;

describe("#Language Id", () => {
  describe("a foo.ml document", () => {
    it("is identified as an ocaml document", () => {
      return using(
        {
          files: {
            "foo.ml": 'let hello () = print_endline "hey there"',
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["foo.ml"]
          );
          expect(document.languageId).toBe("ocaml");
        }
      );
    });
  });

  describe("a main.ml document", () => {
    it("is identified as an ocaml document", () => {
      return using(
        {
          files: {
            "main.ml": dedent(`
              let () = Foo.hello ()

              let () = Base.Printf.printf "hello"
            `),
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["main.ml"]
          );
          expect(document.languageId).toBe("ocaml");
        }
      );
    });
  });

  describe("an module.mli document", () => {
    it("is identified as an ocaml.interface document", () => {
      return using(
        {
          files: {
            "module.mli": "type t",
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["module.mli"]
          );
          expect(document.languageId).toBe("ocaml.interface");
        }
      );
    });
  });

  describe("a lexer.mll document", () => {
    it("is identified as an ocaml.ocamllex document", () => {
      return using(
        {
          files: {
            "lexer.mll": dedent(`
              rule token = parse
                [' ' '\t']       { token lexbuf }     (* skip blanks *)
                | ['\n' ]        { EOL }
                | ['0'-'9']+ as lxm { INT(int_of_string lxm) }
                | '+'            { PLUS }
                | '-'            { MINUS }
                | '*'            { TIMES }
                | '/'            { DIV }
                | '('            { LPAREN }
                | ')'            { RPAREN }
                | eof            { raise Eof }
            `),
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["lexer.mll"]
          );
          expect(document.languageId).toBe("ocaml.ocamllex");
        }
      );
    });
  });

  describe("a sample.opam document", () => {
    it("is identified as an ocaml.opam document", () => {
      return using(
        {
          files: {
            "sample.opam": dedent(`
              opam-version: "2.0"
              name: "sample-opam"
              maintainer: "foobar"
              authors: "foobar"
              homepage: "foo"
              description: "Description"
              synopsis: "Synopsis"
              bug-reports: "https//foo.bar"
              depends: [
                "ocaml"             {>= "4.04.2" & < "4.13.0"}
                "base"              {>= "v0.12" }
              ]
            `),
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["sample.opam"]
          );
          expect(document.languageId).toBe("ocaml.opam");
        }
      );
    });
  });

  describe("a parser.mly document", () => {
    it("is identified as an ocaml.menhir document", () => {
      return using(
        {
          files: {
            "parser.mly": dedent(`
              %{
                [@@@coverage exclude_file]
                open Ast.Ast_types
                open Parsed_ast
              %}
            `),
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["parser.mly"]
          );
          expect(document.languageId).toBe("ocaml.menhir");
        }
      );
    });
  });

  describe("a Duration.re document", () => {
    it("is identified as a reason document", () => {
      return using(
        {
          files: {
            "Duration.re": dedent(`
              type t = int;
              let fromSeconds = value => value;
              let add = (x, y) => x + y;
            `),
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["Duration.re"]
          );
          expect(document.languageId).toBe("reason");
        }
      );
    });
  });

  describe("a Duration.rei document", () => {
    it("is identified as a reason document", () => {
      return using(
        {
          files: {
            "Duration.rei": dedent(`
              type t;
              let fromSeconds: int => t;
              let add: (t, t) => t;
            `),
          },
        },
        async (mapFileToUri) => {
          const document = await workspace.openTextDocument(
            mapFileToUri["Duration.rei"]
          );
          expect(document.languageId).toBe("reason");
        }
      );
    });
  });
});
