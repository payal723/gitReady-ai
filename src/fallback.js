export function generateFallbackCommitMessage(diff) {
    const lowerDiff = diff.toLowerCase();
    
    // 1. Extract file names from the diff to be more specific
    // This regex looks for files being changed in the git diff format
    const changedFiles = [...diff.matchAll(/\+\+\+ b\/(.*)/g)].map(m => m[1]);
    const mainFile = changedFiles[0] || "";

    // 2. Logic for Documentation
    if (changedFiles.some(f => f.toLowerCase().includes("readme.md"))) {
        return "docs: update project documentation";
    }

    // 3. Logic for Styles (CSS/SCSS)
    if (changedFiles.some(f => f.endsWith(".css") || f.endsWith(".scss"))) {
        const fileName = mainFile.split('/').pop();
        return `style: updated styling in ${fileName || 'project'}`;
    }

    // 4. Logic for Dependencies/Config
    if (lowerDiff.includes("package.json")) {
        if (lowerDiff.includes("\"dependencies\"") || lowerDiff.includes("\"devdependencies\"")) {
            return "build: update npm dependencies";
        }
        return "chore: update package configuration";
    }

    // 5. Logic for Images/Assets
    if (changedFiles.some(f => /\.(png|jpg|jpeg|gif|svg|ico)$/i.test(f))) {
        return "assets: update image resources";
    }

    // 6. Logic for Bug Fixes (Based on common patterns)
    if (lowerDiff.includes("console.log") && lowerDiff.startsWith("-")) {
        return "chore: remove debug logs";
    }
    if (lowerDiff.includes("fix") || lowerDiff.includes("prevent") || lowerDiff.includes("issue")) {
        return "fix: resolve detected logic issue";
    }

    // 7. Folder-based Logic (Specific to React/Frontend)
    if (mainFile.includes("components/")) {
        const componentName = mainFile.split('/').pop().split('.')[0];
        return `feat: update ${componentName} component`;
    }

    if (mainFile.includes("utils/") || mainFile.includes("helpers/")) {
        return "refactor: optimize utility functions";
    }

    // 8. Default fallback based on file extension
    if (mainFile.endsWith(".js") || mainFile.endsWith(".jsx") || mainFile.endsWith(".ts")) {
        return `feat: update logic in ${mainFile.split('/').pop()}`;
    }

    if (mainFile.endsWith(".html")) {
        return "feat: update html structure";
    }

    // Final Catch-all
    return "chore: general project maintenance";
}