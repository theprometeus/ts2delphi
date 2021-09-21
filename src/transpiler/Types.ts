import { StatementedNode } from "ts-morph";

export interface TypeDeclaration {
    /**
     * The declaration name
     */
    name: string;

    /**
     * The declaration privacy
     */
    privacy?: "public" | "private" | "protected";

    /**
     * The declaration body
     */
    body?: TypeDeclaration[];
}

/**
 * Structure for a struct declaration
 */
interface StructDeclaration {
    type: "struct";
    body?: DeclarationTypes[]
}

/**
 * Structure for a class declaration
 */
interface ClassDeclaration {
    type: "class";
    extends?: string;
    members?: Record<string, (DeclarationTypes & {
        static: boolean
    })>;
}

/**
 * Available declaration types
 */
export type DeclarationTypes = TypeDeclaration & (
    {
        /**
         * The declaration type
         */
        type: "struct" | "var" | "const" | "function";
    } |
    StructDeclaration |
    ClassDeclaration
)

/**
 * Available Pascal types
 */
export type PascalTypes = string | "String" | "Integer" | "Float" | "Boolean" | "DWORD";

/**
 * Declaration for an implementation
 */
export interface ImplementationDeclaration {
    /**
     * The implementation type
     */
    type: "procedure" | "function" | "constructor";

    /**
     * The implementation name
     */
    name: string,

    /**
     * The implementation arguments
     */
    args?: Record<string, DeclarationTypes>;

    /**
     * The return type of the implementation
     */
    returns?: PascalTypes;

    /**
     * The implementation variables
     */
    vars?: Record<string, DeclarationTypes>;

    /**
     * The implementation body
     */
    body: StatementedNode
}

/**
 * Common types between TypeScript and Pascal
 */
export const CommonTypes = {
    string: "String",
    number: "Float",
    int: "Integer",
    boolean: "Boolean",
    bool: "Boolean"
}