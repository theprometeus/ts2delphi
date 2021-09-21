import { SourceFile } from "ts-morph";
import Transpiler from "../Transpiler";
import UnitWriter from "../UnitWriter";

type LexerResult = Promise<any> | void;

export class TranspilerLexer {
    constructor(
        public transpiler: Transpiler,
        public file: SourceFile,
        public unit: UnitWriter,
    ) {

    }

    /**
     * Retrieves an array with Delphi's reserved keywords
     * @returns 
     */
    protected getReservedKeywords() {
        return Transpiler.ReservedKeywords;
    }

    /**
     * Parses the file declarations
     * @abstract
     * @throws TranspilationError
     */
    public lex(): LexerResult {
        
    }
}