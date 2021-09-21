import { TranspilerParser } from "../Parser"
import { TypeDeclaration } from "../Types";

export default class TypeParser extends TranspilerParser {
    public parse() {
        // Iterate over all declared types
        for(let index in this.unit.types) {
            const type = this.unit.types[index];

            let definition = `${type.name} = ${type.type}`;

            // Check if it's a class and extends anything
            if (type.type === "class" && !!type.extends) {
                definition += ` (${type.extends})`;
            }

            // Write the header first
            this.unit.writeLine(definition);
            this.unit.adjustIdentation();

            // Then write the body if any
            if (type.body) {
                const publicDecs = type.body.filter((dec) => dec.privacy === "public");
                const privateDecs = type.body.filter((dec) => dec.privacy === "private");
                const protectedDecs = type.body.filter((dec) => dec.privacy === "protected");

                this.writeDeclarations("public", publicDecs);
                this.writeDeclarations("private", privateDecs);
                this.writeDeclarations("protected", protectedDecs);
            }

            this.unit.adjustIdentation(-1);
        }
    }

    private writeDeclarations(type: "public" | "protected" | "private", declarations: TypeDeclaration[]) {
        // Check if has any public declaration
        if (declarations.length) {
            this.unit.writeLine(type);
            this.unit.adjustIdentation();

                // Iterate over all declarations
                declarations.forEach((dec) => {
                    this.unit.writeLine(dec.name);
                });

            this.unit.adjustIdentation(-1);
        }
    }
}