package com.vinayaka.dsa;

import java.util.List;

public class LeetCodeProblemResponse {

    private String questionFrontendId;
    private String title;
    private String difficulty;
    private List<TopicTag> topicTags;
    private String url;

    public String getQuestionFrontendId() {
        return questionFrontendId;
    }

    public void setQuestionFrontendId(String questionFrontendId) {
        this.questionFrontendId = questionFrontendId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public List<TopicTag> getTopicTags() {
        return topicTags;
    }

    public void setTopicTags(List<TopicTag> topicTags) {
        this.topicTags = topicTags;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public static class TopicTag {

        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}