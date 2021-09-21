import path from "path";

import { TranspilationError } from "../../Transpiler";
import { TranspilerLexer } from "../Lexer";

const debug = require("debug")("ts2delphi:transpiler:imports");

export default class ImportLexer extends TranspilerLexer {
    public lex() {
        // Retrieve all imports to convert them into uses
        this.file.getImportDeclarations().forEach((declaration) => {
            const specifier = declaration.getModuleSpecifier();
            const unitName = specifier.getLiteralText();

            debug("parsing import %s...", unitName);

            // Check if it's importing a Delphi system unit (not a custom TS or Pascal file)
            if (unitName.startsWith("@delphi/") && (!unitName.endsWith(".ts") || !unitName.endsWith(".pas"))) {
                // Add it to the uses replacing with PascalCase
                this.unit.addUses(
                    unitName
                        .replace("@delphi/", "")
                        .replace(/\//g, ".")
                    );
            } else {
                // Resolve it first
                const resolved =
                    path.relative(
                        this.transpiler.options.input,
                        path.resolve(this.transpiler.options.input, unitName)
                    ) + ".pas";

                // Retrieve only the resolved unit name
                const resolvedName = path.basename(resolved, ".pas");

                // Check if it's a reserved keyword
                if (this.getReservedKeywords().includes(resolvedName)) {
                    throw new TranspilationError("`" + resolvedName + "` is a reserved keyword.");
                }

                // Consider it as a normal unit
                this.unit.addUses(resolvedName, resolved);
            }
        });
    }
};