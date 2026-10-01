package com.vinayaka.dsa;

public class UserGoalsResponse {

    private Integer weeklyGoal;
    private Integer monthlyGoal;
    private Integer targetGoal;

    public UserGoalsResponse(
            Integer weeklyGoal,
            Integer monthlyGoal,
            Integer targetGoal) {

        this.weeklyGoal = weeklyGoal;
        this.monthlyGoal = monthlyGoal;
        this.targetGoal = targetGoal;
    }

    public Integer getWeeklyGoal() {
        return weeklyGoal;
    }

    public Integer getMonthlyGoal() {
        return monthlyGoal;
    }

    public Integer getTargetGoal() {
        return targetGoal;
    }
}