package com.vinayaka.dsa;

import java.util.List;

public class DSAProblemResponse {

    private String problemNumber;
    private String problemName;
    private List<String> topics;

    public DSAProblemResponse(
            String problemNumber,
            String problemName,
            List<String> topics) {

        this.problemNumber = problemNumber;
        this.problemName = problemName;
        this.topics = topics;
    }

    public String getProblemNumber() {
        return problemNumber;
    }

    public String getProblemName() {
        return problemName;
    }

    public List<String> getTopics() {
        return topics;
    }
}