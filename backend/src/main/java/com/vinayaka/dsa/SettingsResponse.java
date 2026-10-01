package com.vinayaka.dsa;
import com.vinayaka.dsa.SettingsResponse;

public class SettingsResponse {

    private String name;
    private String email;
    private String githubUsername;
    private String repositoryName;
    private boolean connected;
    private int weeklyGoal;
    private int monthlyGoal;
    private int targetGoal;

    public SettingsResponse() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public String getRepositoryName() {
        return repositoryName;
    }

    public void setRepositoryName(String repositoryName) {
        this.repositoryName = repositoryName;
    }

    public boolean isConnected() {
        return connected;
    }

    public void setConnected(boolean connected) {
        this.connected = connected;
    }

    public int getWeeklyGoal() {
        return weeklyGoal;
    }

    public void setWeeklyGoal(int weeklyGoal) {
        this.weeklyGoal = weeklyGoal;
    }

    public int getMonthlyGoal() {
        return monthlyGoal;
    }

    public void setMonthlyGoal(int monthlyGoal) {
        this.monthlyGoal = monthlyGoal;
    }

    public int getTargetGoal() {
        return targetGoal;
    }

    public void setTargetGoal(int targetGoal) {
        this.targetGoal = targetGoal;
    }
}