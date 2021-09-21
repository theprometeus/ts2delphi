import fs from "fs/promises";
import path from "path";
import { FunctionDeclaration, ScriptTarget, SourceFile, ts } from "ts-morph";
import { Project } from "ts-simple-ast-extra";
import { TranspilerLexer } from "./transpiler/Lexer";
import ClassLexer from "./transpiler/lexers/Class";
import FunctionTranspiler from "./transpiler/lexers/Functions";
import ImportTranspiler from "./transpiler/lexers/Imports";
import UnitWriter from "./UnitWriter";

const debug = require("debug")("ts2delphi");
require("debug").enable("*");

/**
 * Reserved Pascal keywords
 */
export const ReservedKeywords = ["unit", "for", "each", "except", "begin", "end", "types", "class"];

/**
 * Used to throw transpilation errors
 */
export class TranspilationError extends Error {

}

export interface TranspilerOptions {
    /**
     * The input directory
     */
    input: string,

    /**
     * The output directory
     */
    output: string,

    /**
     * The program entry point file
     */
    main: string
}

export default class Transpiler {
    /**
     * Any reserved Delphi keywords
     */
    public static ReservedKeywords = ReservedKeywords;

    public static Lexers: (typeof TranspilerLexer)[] = [
        ImportTranspiler,
        FunctionTranspiler,
        ClassLexer
    ];

    public options: TranspilerOptions;

    /**
     * The TypeScript project
     */
    protected project: Project = new Project({
        compilerOptions: {
            outDir: "%appdata%"
        }
    });

    constructor(options: TranspilerOptions) {
        this.options = options;

        // Set the output directory
        this.project.compilerOptions.set({
            outDir: this.options.output,
            target: ScriptTarget.ES3,
            allowJs: false,
            esModuleInterop: true
        });
    }

    /**
     * Transpiles the entire input directory and subdirectories
     * @returns 
     */
    public async transpileRoot() {
        await this.transpileDirectory(this.options.input);

        return true;
    }

    /**
     * Transpiles an entire directory
     * @param directory The directory to be transpiled
     * @returns 
     */
    protected async transpileDirectory(directory) {
        return fs.readdir(directory).then(async (files) => {
            for(let file of files) {
                // Resolve the file path
                file = path.resolve(directory, file);

                // Retrieve the file stats
                const stat = await fs.stat(file);

                // If it's a directory, transpile it too
                if (stat.isDirectory()) {
                    await this.transpileDirectory(file);
                    continue;
                }

                // Add it to the project
                const sourceFile = this.project.addExistingSourceFile(file);

                // Transpile it
                await this.transpile(sourceFile);
            }
        });
    }

    /**
     * Transpiles a single file
     * @param sourceFile The source file to be transpiled
     */
    protected async transpile(sourceFile: SourceFile) {
        const filename = sourceFile.getFilePath();

        // Retrive the file name
        const name = path.basename(filename, ".ts");

        // Retrieve the relative file path
        const relative = path.relative(path.dirname(filename), this.options.input);
        const relativePath = path.join(relative, name + ".ts");

        // Retrieve the file output path
        const output = path.resolve(this.options.output, relative, name + ".pas");

        let type: "unit" | "program" = "unit";

        debug("transpiling %s", relativePath);

        // Check if it's the main program file
        if (relativePath === this.options.main) {
            debug("possible entry point is %s", relativePath);

            // Check if has no exported "begin" function
            if (!(
                sourceFile
                .getDefaultExportSymbolOrThrow()
                    .getValueDeclarationOrThrow() instanceof FunctionDeclaration
                )
            ) {
                throw new TranspilationError("The main program file needs to have an exported `begin` function.");
            }

            type = "program";
        }

        let unit = new UnitWriter(this, sourceFile);

        // Write the header
        unit
            .setUnitType(type, name);

        // Parse the unit
        await unit.parse();

        // Save the file
        return fs.writeFile(
            output,
            unit.toString()
        );
    }
}