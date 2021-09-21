import Transpiler from "../src/Transpiler";

const transpiler = new Transpiler({
    input: __dirname + "/in/",
    output: __dirname + "/out/",
    main: "Program.ts"
});

transpiler.transpileRoot();