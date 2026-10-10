package com.vinayaka.dsa.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_goals")
public class UserGoals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "weekly_goal")
    private Integer weeklyGoal;

    @Column(name = "monthly_goal")
    private Integer monthlyGoal;

    @Column(name = "target_goal")
    private Integer targetGoal;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Weekly 7-day cycle
    @Column(name = "weekly_start_date")
    private LocalDate weeklyStartDate;

    @Column(name = "weekly_start_solved")
    private Integer weeklyStartSolved;

    // Monthly 30-day cycle
    @Column(name = "monthly_start_date")
    private LocalDate monthlyStartDate;

    @Column(name = "monthly_start_solved")
    private Integer monthlyStartSolved;

    // Previous weekly cycle result
    @Column(name = "previous_weekly_solved")
    private Integer previousWeeklySolved;

    @Column(name = "previous_weekly_completed")
    private Boolean previousWeeklyCompleted;

    // Previous 30-day cycle result
    @Column(name = "previous_monthly_solved")
    private Integer previousMonthlySolved;

    @Column(name = "previous_monthly_completed")
    private Boolean previousMonthlyCompleted;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;



    public UserGoals() {
    }

    public UserGoals(Integer weeklyGoal,
                     Integer monthlyGoal,
                     Integer targetGoal,
                     User user) {

        this.weeklyGoal = weeklyGoal;
        this.monthlyGoal = monthlyGoal;
        this.targetGoal = targetGoal;
        this.user = user;
    }

    public Long getId() {
        return id;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // Weekly cycle getters/setters

    public LocalDate getWeeklyStartDate() {
        return weeklyStartDate;
    }

    public void setWeeklyStartDate(LocalDate weeklyStartDate) {
        this.weeklyStartDate = weeklyStartDate;
    }

    public Integer getWeeklyStartSolved() {
        return weeklyStartSolved;
    }

    public void setWeeklyStartSolved(Integer weeklyStartSolved) {
        this.weeklyStartSolved = weeklyStartSolved;
    }

    // 30-day cycle getters/setters

    public LocalDate getMonthlyStartDate() {
        return monthlyStartDate;
    }

    public void setMonthlyStartDate(LocalDate monthlyStartDate) {
        this.monthlyStartDate = monthlyStartDate;
    }

    public Integer getMonthlyStartSolved() {
        return monthlyStartSolved;
    }

    public void setMonthlyStartSolved(Integer monthlyStartSolved) {
        this.monthlyStartSolved = monthlyStartSolved;
    }

    public Integer getPreviousWeeklySolved() {
        return previousWeeklySolved;
    }

    public void setPreviousWeeklySolved(Integer previousWeeklySolved) {
        this.previousWeeklySolved = previousWeeklySolved;
    }

    public Boolean getPreviousWeeklyCompleted() {
        return previousWeeklyCompleted;
    }

    public void setPreviousWeeklyCompleted(Boolean previousWeeklyCompleted) {
        this.previousWeeklyCompleted = previousWeeklyCompleted;
    }

    public Integer getPreviousMonthlySolved() {
        return previousMonthlySolved;
    }

    public void setPreviousMonthlySolved(Integer previousMonthlySolved) {
        this.previousMonthlySolved = previousMonthlySolved;
    }

    public Boolean getPreviousMonthlyCompleted() {
        return previousMonthlyCompleted;
    }

    public void setPreviousMonthlyCompleted(Boolean previousMonthlyCompleted) {
        this.previousMonthlyCompleted = previousMonthlyCompleted;
    }
}