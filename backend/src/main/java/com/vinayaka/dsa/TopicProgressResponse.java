package com.vinayaka.dsa;

public class TopicProgressResponse {

    private String topic;
    private int solvedCount;

    public TopicProgressResponse(String topic, int solvedCount) {
        this.topic = topic;
        this.solvedCount = solvedCount;
    }

    public String getTopic() {
        return topic;
    }

    public int getSolvedCount() {
        return solvedCount;
    }
}