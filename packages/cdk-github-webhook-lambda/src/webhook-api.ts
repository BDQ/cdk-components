import * as Octokit from '@octokit/rest';
import * as parseGithubUrl from 'parse-github-url';

const octokit = new Octokit();

export const createWebhook = async (
    githubApiToken: string,
    githubRepoUrl: string,
    payloadUrl: string,
    events: string[],
): Promise<Octokit.Response<Octokit.ReposCreateHookResponse>> => {
    octokit.authenticate({ type: 'token', token: githubApiToken });

    const gh = parseGithubUrl(githubRepoUrl);

    if (gh === null || gh.owner === null || gh.name === null) {
        throw new Error('GithubRepoUrl is not correct');
    }

    const params = {
        name: 'web',
        owner: gh.owner,
        repo: gh.name,
        config: { url: payloadUrl, content_type: 'json' },
        events,
        active: true,
    };

    return octokit.repos.createHook(params);
};

export const updateWebhook = async (
    githubApiToken: string,
    githubRepoUrl: string,
    payloadUrl: string,
    events: string[],
    hookId: number,
): Promise<Octokit.Response<Octokit.ReposUpdateHookResponse>> => {
    octokit.authenticate({ type: 'token', token: githubApiToken });

    const gh = parseGithubUrl(githubRepoUrl);

    if (gh === null || gh.owner === null || gh.name === null) {
        throw new Error('GithubRepoUrl is not correct');
    }

    const params = {
        owner: gh.owner,
        repo: gh.name,
        config: { url: payloadUrl, content_type: 'json' },
        events,
        active: true,
        hook_id: hookId,
    };

    return octokit.repos.updateHook(params);
};

export const deleteWebhook = async (
    githubApiToken: string,
    githubRepoUrl: string,
    hookId: number,
): Promise<Octokit.Response<Octokit.ReposDeleteResponse>> => {
    octokit.authenticate({ type: 'token', token: githubApiToken });

    const gh = parseGithubUrl(githubRepoUrl);

    if (gh === null || gh.owner === null || gh.name === null) {
        throw new Error('GithubRepoUrl is not correct');
    }
    const params = {
        owner: gh.owner,
        repo: gh.name,
        hook_id: hookId,
    };

    return octokit.repos.deleteHook(params);
};
