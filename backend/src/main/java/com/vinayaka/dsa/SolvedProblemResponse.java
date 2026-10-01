package com.vinayaka.dsa;

import java.util.List;

public class SolvedProblemResponse {

    private String problemNumber;
    private String title;
    private String platform;
    private String difficulty;
    private String problemUrl;
    private List<String> topics;

    public SolvedProblemResponse(
            String problemNumber,
            String title,
            String platform,
            String difficulty,
            String problemUrl,
            List<String> topics) {

        this.problemNumber = problemNumber;
        this.title = title;
        this.platform = platform;
        this.difficulty = difficulty;
        this.problemUrl = problemUrl;
        this.topics = topics;
    }

    public String getProblemNumber() {
        return problemNumber;
    }

    public String getTitle() {
        return title;
    }

    public String getPlatform() {
        return platform;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getProblemUrl() {
        return problemUrl;
    }

    public List<String> getTopics() {
        return topics;
    }
}