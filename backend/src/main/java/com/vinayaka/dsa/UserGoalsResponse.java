package com.vinayaka.dsa;

import java.time.LocalDate;

public class UserGoalsResponse {

    private Integer weeklyGoal;
    private Integer monthlyGoal;
    private Integer targetGoal;

    private LocalDate weeklyStartDate;
    private Integer weeklyStartSolved;

    private LocalDate monthlyStartDate;
    private Integer monthlyStartSolved;

    private Integer previousWeeklySolved;
    private Boolean previousWeeklyCompleted;

    private Integer previousMonthlySolved;
    private Boolean previousMonthlyCompleted;

    public UserGoalsResponse(
            Integer weeklyGoal,
            Integer monthlyGoal,
            Integer targetGoal,
            LocalDate weeklyStartDate,
            Integer weeklyStartSolved,
            LocalDate monthlyStartDate,
            Integer monthlyStartSolved,
            Integer previousWeeklySolved,
            Boolean previousWeeklyCompleted,
            Integer previousMonthlySolved,
            Boolean previousMonthlyCompleted) {

        this.weeklyGoal = weeklyGoal;
        this.monthlyGoal = monthlyGoal;
        this.targetGoal = targetGoal;

        this.weeklyStartDate = weeklyStartDate;
        this.weeklyStartSolved = weeklyStartSolved;

        this.monthlyStartDate = monthlyStartDate;
        this.monthlyStartSolved = monthlyStartSolved;

        this.previousWeeklySolved = previousWeeklySolved;
        this.previousWeeklyCompleted = previousWeeklyCompleted;

        this.previousMonthlySolved = previousMonthlySolved;
        this.previousMonthlyCompleted = previousMonthlyCompleted;
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

    public Integer getPreviousWeeklySolved() {
        return previousWeeklySolved;
    }

    public Boolean getPreviousWeeklyCompleted() {
        return previousWeeklyCompleted;
    }

    public Integer getPreviousMonthlySolved() {
        return previousMonthlySolved;
    }

    public Boolean getPreviousMonthlyCompleted() {
        return previousMonthlyCompleted;
    }

    public LocalDate getWeeklyStartDate() {
        return weeklyStartDate;
    }

    public Integer getWeeklyStartSolved() {
        return weeklyStartSolved;
    }

    public LocalDate getMonthlyStartDate() {
        return monthlyStartDate;
    }

    public Integer getMonthlyStartSolved() {
        return monthlyStartSolved;
    }
}