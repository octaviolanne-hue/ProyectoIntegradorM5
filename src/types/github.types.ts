export type RepoDTO = {
    full_name: string;
    html_url: string;
    private: boolean;
    description: string | null;
    owner: {
        login: string;
    };
};