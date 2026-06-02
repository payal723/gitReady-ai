export function generateFallbackCommitMessage(diff) {
    const lowerDiff = diff.toLowerCase();
    
    // 1. Extract file names from the diff to be more specific
    // This regex looks for files being changed in the git diff format
    const changedFiles = [...diff.matchAll(/\+\+\+ b\/(.*)/g)].map(m => m[1]);
    const mainFile = changedFiles[0] || "";

    if (changedFiles.some(f => f.toLowerCase().includes("readme.md"))) {
        return "docs: update project documentation";
    }

    if (changedFiles.some(f => f.endsWith(".css") || f.endsWith(".scss"))) {
        const fileName = mainFile.split('/').pop();
        return `style: updated styling in ${fileName || 'project'}`;
    }

    if (lowerDiff.includes("package.json")) {
        if (lowerDiff.includes("\"dependencies\"") || lowerDiff.includes("\"devdependencies\"")) {
            return "build: update npm dependencies";
        }
        return "chore: update package configuration";
    }

    if (changedFiles.some(f => /\.(png|jpg|jpeg|gif|svg|ico)$/i.test(f))) {
        return "assets: update image resources";
    }

    if (lowerDiff.includes("console.log") && lowerDiff.startsWith("-")) {
        return "chore: remove debug logs";
    }
    if (lowerDiff.includes("fix") || lowerDiff.includes("prevent") || lowerDiff.includes("issue")) {
        return "fix: resolve detected logic issue";
    }

    if (mainFile.includes("components/")) {
        const componentName = mainFile.split('/').pop().split('.')[0];
        return `feat: update ${componentName} component`;
    }

    if (mainFile.includes("utils/") || mainFile.includes("helpers/")) {
        return "refactor: optimize utility functions";
    }

    if (mainFile.endsWith(".js") || mainFile.endsWith(".jsx") || mainFile.endsWith(".ts")) {
        return `feat: update logic in ${mainFile.split('/').pop()}`;
    }

    if (mainFile.endsWith(".html")) {
        return "feat: update html structure";
    }

    return "chore: general project maintenance";
}