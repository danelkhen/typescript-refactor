import { readFileSync } from "fs";
import { SourceFile, Node, forEachChild, SyntaxKind, createSourceFile, ScriptTarget } from "typescript";
import * as ts from "typescript";

const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
    let sourceFile = createSourceFile(fileName, readFileSync(fileName).toString(), ScriptTarget.ES5, /*setParentNodes */ true);

    let ces = sourceFile.statements.filter(t => t.kind == SyntaxKind.InterfaceDeclaration) as ts.InterfaceDeclaration[];
    ces.forEach(ce => {
        let ceName = ce.name.getText(sourceFile);
        console.log(`class ${ceName}Client extends Proxy<${ceName}> {`);
        let members = ce.members.filter(t => t.kind == SyntaxKind.MethodSignature) as ts.MethodSignature[];
        let lines = members.map(me => {
            let me2 = {
                name: me.name.getText(sourceFile),
                prm: { type: me.parameters[0].type.getText(sourceFile), name: me.parameters[0].name.getText(sourceFile) },
                type: me.type.getText(sourceFile),
            };
            let line = `    ${me2.name}(${me2.prm.name}: ${me2.prm.type}): Promise<${me2.type}> { return this.invoke(t => t.${me2.name}(${me2.prm.name})); }\n`;
            return line;
        });
        console.log(lines.join(""));
        console.log("}");
    });
});

export function getChildren(node: Node): Node[] {
    let list: Node[] = [];
    forEachChild(node, t => list.push(t));
    return list;
}

