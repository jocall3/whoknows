// comment-broken-imports.js
const { Project } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json", // adjust if needed
});    

project.getSourceFiles().forEach(file => {
    let modified = false;

    file.getImportDeclarations().forEach(imp => {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        const namedImports = imp.getNamedImports();

        namedImports.forEach(named => {
            const name = named.getName();

            try {
                // Try to require the module (Node.js resolution)
                const moduleExports = require(moduleSpecifier);
                if (!moduleExports[name]) {
                    // Comment out the broken import
                    const fullText = named.getText();
                    named.replaceWithText(`/* MISSING: ${fullText} */`);
                    modified = true;
                    console.log(`Commented out ${name} in ${file.getFilePath()}`);
                }
            } catch {
                // Cannot resolve module, comment out whole import line
                const importText = imp.getText();
                imp.replaceWithText(`/* MISSING MODULE: ${importText} */`);
                modified = true;
                console.log(`Commented out entire import in ${file.getFilePath()}`);
            }
        });
    });

    if (modified) {
        file.saveSync();
    }
});

console.log("Broken imports commented out successfully.");