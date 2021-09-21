import { TranspilerLexer } from "../Lexer";

const debug = require("debug")("ts2delphi:transpiler:lexers:functions");

export default class FunctionLexer extends TranspilerLexer {
    public lex() {
        // Iterate over all declared functions
        this.file.getFunctions().forEach((fn) => {
            // Check if it's not named
            if (fn.getName() === undefined) {
                // Check if the function is a default export
                if (fn.isDefaultExport()) {
                    debug("found the default unit entry point");

                    // Set it as the unit body
                    this.unit.setBody(fn.getBodyOrThrow());
                }

                return;
            }

            // Retrieve the function parameters
            const name = fn.getName();
            const args = fn.getParameters();
            const returns = fn.getReturnType();

            // Check if it's an exported function
            if (fn.isExported()) {
                // Declare the type at the "type" section
                this.unit.addType({
                    name,
                    type: "function"
                });
            }

            // Declare it at the "implementation" section
            this.unit.addImplementation("function", name, args, returns, fn);
        });
    }
};