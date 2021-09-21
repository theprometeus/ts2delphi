import { BinaryExpression, Expression, ExpressionStatement, PropertyAccessExpression, Statement, SyntaxKind, ThisExpression, VariableStatement } from "ts-morph";
import { TranspilerParser } from "../Parser";

const debug = require("debug")("ts2delphi:transpiler:parsers:implementation");

export default class ImplementationParser extends TranspilerParser {
    public parse() {
        let tempBody = [];
        let tempVars = [];

        // Iterate over all declared implementations
        for(let index in this.unit.implementation) {
            const impl = this.unit.implementation[index];

            // Ex.: function FunctionName: ReturnType;
            this.unit.writeLine(`${impl.type} ${impl.name}: ${impl.returns};`);

            // First of all, retrieve all variable declarations
            const vars = impl.body.getVariableDeclarations();

            // Check if has any
            if (vars.length) {
                // Declare them at the headers first
                this.unit.writeLine(`var`);
                this.unit.adjustIdentation();

                vars.forEach((v) => {
                    this.unit.writeLine(`${v.getName()}: ${v.getType().getText()};`);
                });

                this.unit.adjustIdentation(-1);
            }

            this.unit.writeLine(`begin`);
            this.unit.adjustIdentation();

            // Iterate over all statements
            this.parseStatements(impl.body.getStatements());

            this.unit.adjustIdentation(-1);
            this.unit.writeLine(`end`);
        }
    }

    public writeExpression(exp: Expression) {
        switch(exp.getKindName()) {
            // Check if it's a binary expression
            case "BinaryExpression":
                let bin = (exp as BinaryExpression);

                const left = bin.getLeft();
                const op = bin.getOperatorToken();
                const right = bin.getRight();

                // Check if it's not a "this" expression
                if (
                    left.getKindName() !== "PropertyAccessExpression" &&
                    (left as PropertyAccessExpression).getName() !== "this"
                ) {
                    // Write it
                    this.unit.writeLine(`${left.getText()} :${op.getText()} ${right.getText()};`);
                } else {
                    // Write it as a literal
                    this.unit.writeIdentated((left as PropertyAccessExpression).getName());
                    this.unit.write(` :${op.getText()} `);
                    this.unit.write(right.getText());
                    this.unit.write(";");
                    this.unit.writeLine();
                }
        }
    }

    public writeStatement(st: Statement) {
        switch(st.getKindName()) {
            // If it's a variable statement
            case "VariableStatement":
            
            break;

            // If it's an expression statement
            case "ExpressionStatement":
                let exp = (st as ExpressionStatement).getExpression();

                this.writeExpression(exp);
            break;

            default:
                debug("unknown statement %s", st.getKindName());
            break;
        };
    }

    public parseStatements(statements: Statement[]) {
        return statements.map((st) => {
            this.writeStatement(st);
        });
    }
}