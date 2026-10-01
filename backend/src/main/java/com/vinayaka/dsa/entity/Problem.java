package com.vinayaka.dsa.entity;

import jakarta.persistence.*;

import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 4)
    private String problemNumber;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String platform;

    @Column(nullable = false)
    private String difficulty;

    @Column(nullable = true)
    private String topic;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getProblemUrl() {
        return problemUrl;
    }

    public void setProblemUrl(String problemUrl) {
        this.problemUrl = problemUrl;
    }

    @Column(nullable = false)
    private String problemUrl;

    public Problem() {
    }

    public Problem(String problemNumber,
                   String title,
                   String platform,
                   String difficulty,
                   String topic,
                   String problemUrl) {
        this.problemNumber = problemNumber;
        this.title = title;
        this.platform = platform;
        this.difficulty = difficulty;
        this.topic = topic;
        this.problemUrl = problemUrl;
    }

    public Problem(
            String problemNumber,
            String title,
            String platform,
            String difficulty,
            String problemUrl) {

        this.problemNumber = problemNumber;
        this.title = title;
        this.platform = platform;
        this.difficulty = difficulty;
        this.problemUrl = problemUrl;
    }

    public String getProblemNumber() {
        return problemNumber;
    }

    public void setProblemNumber(String problemNumber) {
        this.problemNumber = problemNumber;
    }

    @ManyToMany
    @JoinTable(
            name = "problem_topics",
            joinColumns = @JoinColumn(name = "problem_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    private Set<Topic> topics;

    public Set<Topic> getTopics() {
        return topics;
    }

    public void setTopics(Set<Topic> topics) {
        this.topics = topics;
    }

    @ManyToMany(mappedBy = "solvedProblems")
    private Set<User> users;

    @JsonIgnore
    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}