package com.vinayaka.dsa;

public class SettingsRequest {

    private String name;
    private String email;
    private String repositoryName;
    private Integer weeklyGoal;
    private Integer monthlyGoal;
    private Integer targetGoal;

    public SettingsRequest() {}

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

    public String getRepositoryName() {
        return repositoryName;
    }

    public void setRepositoryName(String repositoryName) {
        this.repositoryName = repositoryName;
    }

    public Integer getWeeklyGoal() {
        return weeklyGoal;
    }

    public void setWeeklyGoal(Integer weeklyGoal) {
        this.weeklyGoal = weeklyGoal;
    }

    public Integer getMonthlyGoal() {
        return monthlyGoal;
    }

    public void setMonthlyGoal(Integer monthlyGoal) {
        this.monthlyGoal = monthlyGoal;
    }

    public Integer getTargetGoal() {
        return targetGoal;
    }

    public void setTargetGoal(Integer targetGoal) {
        this.targetGoal = targetGoal;
    }
}