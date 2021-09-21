import { ClassDeclaration, PropertyDeclaration } from "ts-morph";
import { TranspilerLexer } from "../Lexer";

const debug = require("debug")("ts2delphi:transpiler:lexers:functions");

export default class ClassLexer extends TranspilerLexer {
    public lex() {
        // Iterate over all classes
        this.file.getClasses().forEach((clazz) => {
            const name = clazz.getName();
            const extend = clazz.getExtends();

            const methods = clazz.getMethods();
            const staticMethods = clazz.getStaticMethods();

            const members = clazz.getProperties();

            // First of all, add it to the types
            this.unit.addType({
                type: "class",
                name,
                extends: extend.getText(),
                members: this.parseMembers(clazz, members)
            });
        });
    }

    private parseMembers(clazz: ClassDeclaration, members: PropertyDeclaration[]) {
        const data = {};

        // Iterate over all members
        members.forEach((member) => {
            // Save the type
            data[member.getSymbol().getName()] = member.getType().getText();

            // Check if has an initializer
            if (member.hasInitializer()) {
                const fakeFn = this.file.addFunction({ name: clazz.getName() + "Constructor" }).addBody();

                // Create a constructor for the class if not created yet
                const impl = this.unit.addImplementation(
                    "constructor", clazz.getName(),
                    null, null,
                    fakeFn
                );

                // Add it to the declarations
                impl.body.addStatements(
                    `this.${member.getSymbol().getName()}=${member.getInitializer().getFullText()};`
                );
            }
        });

        return data;
    };
};