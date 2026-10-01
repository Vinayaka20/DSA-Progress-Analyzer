package com.vinayaka.dsa.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_problems")
public class UserProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private LocalDate solvedDate;

    @Column
    private String githubFileUrl;

    public UserProblem() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }

    public LocalDate getSolvedDate() {
        return solvedDate;
    }

    public void setSolvedDate(LocalDate solvedDate) {
        this.solvedDate = solvedDate;
    }

    public String getGithubFileUrl() {
        return githubFileUrl;
    }

    public void setGithubFileUrl(String githubFileUrl) {
        this.githubFileUrl = githubFileUrl;
    }

    public UserProblem(User user, Problem problem,
                       LocalDate solvedDate, String githubFileUrl) {

        this.user = user;
        this.problem = problem;
        this.solvedDate = solvedDate;
        this.githubFileUrl = githubFileUrl;
    }
}