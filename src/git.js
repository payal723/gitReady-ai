import simpleGit from 'simple-git';

// Ensure the tool runs in the directory where the command is executed
const git = simpleGit({
    baseDir: process.cwd(),
    binary: 'git',
});

export async function getGitDiff() {
    try {
        const isRepo = await git.checkIsRepo();

        if (!isRepo) {
            return { error: 'NOT_A_REPO' };
        }

        // Use --staged to get only staged changes
        const diff = await git.diff(['--staged']);

        // Return the diff or an empty string if no staged changes exist
        return { diff: diff || '' };

    } catch (err) {
        return { error: err.message };
    }
}

export async function commitCode(message) {
    return await git.commit(message);
}