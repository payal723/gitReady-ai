import simpleGit from 'simple-git';

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

        const diff = await git.diff(['--staged']);

        return { diff: diff || '' };

    } catch (err) {
        return { error: err.message };
    }
}

export async function commitCode(message) {
    return await git.commit(message);
}