import { SourceFile } from "ts-morph";
import Transpiler from "../Transpiler";
import UnitWriter from "../UnitWriter";

type ParserResult = Promise<any> | void;

export class TranspilerParser {
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
    public parse(): ParserResult {
        
    }
}