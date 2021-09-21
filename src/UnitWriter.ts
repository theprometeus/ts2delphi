import { StatementedNode,  Node, ParameterDeclaration, SourceFile, Type } from "ts-morph";
import Transpiler from "./Transpiler";
import { TranspilerLexer } from "./transpiler/Lexer";
import ImplementationParser from "./transpiler/parsers/Implementation";
import TypeParser from "./transpiler/parsers/Type";
import { CommonTypes, DeclarationTypes, ImplementationDeclaration } from "./transpiler/Types";

const debug = require("debug")("ts2delphi:unitwriter");

export type UnitType = "unit" | "program";

/**
 * Class used to write Delphi units
 */
export default class UnitWriter {
    /**
     * The file output content
     */
    protected content: string = "";

    /**
     * The current identation level
     */
    protected currentIdentation: number = 0;

    /**
     * An array containing all transpiled uses
     */
    public uses: string[] = [];

    /**
     * An array containing all transpiled types
     */
    public types: Record<string, DeclarationTypes> = {};

    /**
     * An array containing all transpiled implementations
     */
    public implementation: Record<string, ImplementationDeclaration> = {};

    /**
     * An array containing all tranpiler method instances
     */
    protected methods: TranspilerLexer[];

    /**
     * The unit data
     */
    public unit: {
        /**
         * The unit type
         */
        type: UnitType,

        /**
         * The unit name
         */
        name: string,

        /**
         * The unit body (code between `begin` and `end.`)
         */
        body?: Node
    };

    constructor(
        protected transpiler: Transpiler,
        protected sourceFile: SourceFile
    ) {

    }

    /**
     * Checks if the unit is a program
     * @returns 
     */
    public isProgram() {
        return this.unit.type === "program";
    }

    /**
     * Sets the unit body
     * @param body The unit body
     * @returns 
     */
    public setBody(body: Node) {
        this.unit.body = body;
        return this;
    }

    /**
     * Adds a unit to be used by the unit
     * @param name The unit name
     * @param unit The unit path (only works if inside a program)
     * @returns 
     */
    public addUses(name, unit?: string) {
        debug("adding `%s` to the uses", name);

        name = name.replace(/(\w+)\.?/g, (letter) => {
            return letter[0].toLocaleUpperCase() + letter.substring(1);
        });

        const unitId = unit !== undefined ? name + ` in '${unit}'` : name;

        if (this.uses.includes(unitId)) {
            return this;
        }

        this.uses.push(unitId);

        return this;
    }

    /**
     * Adds a type implementation to the unit
     * @param name The unit name
     * @param unit The unit path (only works if inside a program)
     * @returns 
     */
    public addType(data: DeclarationTypes) {
        debug("adding `%s` to the types", data.name);

        // Fix the name
        data.name = data.name.replace(/(\w+)\.?/g, (letter) => {
            return letter[0].toLocaleUpperCase() + letter.substring(1);
        });

        // Create an index for it
        const index = data.name + (data.type === "class" ? data.extends : "");

        // Check if it's already declared
        if (this.types[index] !== undefined) {
            return this;
        }

        // Declare it
        this.types[index] = data;

        return this;
    }

    /**
     * Adds an implementation to the unit
     * @param type The implementation type (function or procedure)
     * @param name The implementation name (identifier)
     * @param args The implementation arguments
     * @param body The implementation body
     * @returns
     */
    public addImplementation(
        type: "function" | "procedure" | "constructor",
        name: string,
        args: ParameterDeclaration[] | null = null,
        returns: Type | null = null,
        body: StatementedNode
    ) {
        // Create an index for this implementation
        const index = type + " " + name;

        // Check if this implementation already exists
        if (this.implementation[index] !== undefined) {
            return this.implementation[index];
        }

        debug("adding `%s` to implementations...", index);

        const parsedArgs = {};
        const parsedVars = {};
        const parsedReturn = returns !== null ? CommonTypes[returns.getText()] || returns.getText() : undefined;

        if (args) {
            args.forEach((arg) => {
                parsedArgs[arg.getName()] = arg.getType();
            });
        }

        // Declare it
        this.implementation[index] = {
            type,
            name,
            args: parsedArgs,
            vars: parsedVars,
            returns: parsedReturn,
            body: body
        };

        return this.implementation[index];
    }

    /**
     * Sets the unit type
     * @param type The unit type
     * @param name The unit name (needs to match with the file name)
     * @returns 
     */
    public setUnitType(type: UnitType, name: string) {
        this.unit = {
            type, name
        };

        return this;
    }

    /**
     * Checks if has any implementation type declarations
     * @returns 
     */
    public hasTypeDeclarations() {
        return Object.keys(this.types).length > 0;
    }

    /**
     * Checks if this unit has any implementation declaration
     * @returns 
     */
    public hasImplementationDeclarations() {
        return Object.keys(this.implementation).length > 0;
    }

    /**
     * Writes a new line to the file
     * @param string The content to be written, optional.
     * @returns 
     */
    public writeLine(string: string = "") {
        return this.writeIdentated(
            string,
            "\n"
        );
    }

    /**
     * Retrieves the identation as a string
     * @returns
     */
    public getIdentationAsString() {
        return"\t".repeat(this.currentIdentation);
    }

    /**
     * Writes literal content
     * @param string The content to be written
     * @returns 
     */
    public write(...string: string[]) {
        this.content += string.join("");
        return this;
    }

    /**
     * Writes identated content
     * @param string The content to be written
     * @returns 
     */
    public writeIdentated(...string: string[]) {
        this.content += this.getIdentationAsString() + string.join("");
        return this;
    }

    /**
     * Adjusts the identation amount
     * @param amount The amount to be increased or decreased
     * @returns 
     */
    public adjustIdentation(amount = 1) {
        this.currentIdentation += amount;
        this.currentIdentation = Math.max(0, this.currentIdentation);

        debug("adjusting the identation to %d", this.currentIdentation);

        return this;
    }

    /**
     * Parses the current unit
     */
    public async parse() {
        // Clear the methods
        this.methods = [];

        // Allow the methods to parse
        for(let method of Transpiler.Lexers) {
            let methodInstance = new method(this.transpiler, this.sourceFile, this);
            await methodInstance.lex();

            // Add it to the handlers
            this.methods.push(methodInstance);

            methodInstance = null;
        }
    }

    /**
     * Retrieves the writer contents
     * @returns 
     */
    protected writeContents() {
        debug("writing contents...");

        debug("unit %s has type %s", this.unit.name, this.unit.type);

        // First, write the unit type
        this.writeLine(`${this.unit.type} ${this.unit.name};`);
        this.writeLine();

        // Then, write the interface
        this.writeLine("interface");
        this.adjustIdentation();

            // Write the uses
            this.writeLine("uses");
            this.adjustIdentation();

                // Write the uses
                this.writeIdentated(
                    this.uses.join(", ") + ";"
                );

                this.writeLine();
                this.adjustIdentation(-1);
                this.writeLine();

            // Check if has any type
            if (this.hasTypeDeclarations()) {
                this.writeLine("type");
                this.adjustIdentation();

                // Parse them
                new TypeParser(this.transpiler, this.sourceFile, this).parse();
                
                this.writeLine();
                this.adjustIdentation(-1);
            }

            // Going out of the interface
            this.adjustIdentation(-1);

            // Check if has any implementations
            if (this.hasImplementationDeclarations()) {
                // Write the implementation
                this.writeLine("implementation");
                this.adjustIdentation();

                    // Parse them
                    new ImplementationParser(this.transpiler, this.sourceFile, this).parse();
                    this.adjustIdentation(-1);
            }

        return this.content;
    }

    public toString() {
        return this.writeContents();
    }
}