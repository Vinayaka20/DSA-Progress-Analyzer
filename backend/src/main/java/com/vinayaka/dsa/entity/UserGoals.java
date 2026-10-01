package com.vinayaka.dsa.entity;

import jakarta.persistence.*;
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
}