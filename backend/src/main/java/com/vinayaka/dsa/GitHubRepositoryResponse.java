package com.vinayaka.dsa;

public class GitHubRepositoryResponse {

    private String name;
    private boolean privateRepository;
    private String htmlUrl;

    public GitHubRepositoryResponse(String name,
                                    boolean privateRepository,
                                    String htmlUrl) {
        this.name = name;
        this.privateRepository = privateRepository;
        this.htmlUrl = htmlUrl;
    }

    public String getName() {
        return name;
    }

    public boolean isPrivateRepository() {
        return privateRepository;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

}