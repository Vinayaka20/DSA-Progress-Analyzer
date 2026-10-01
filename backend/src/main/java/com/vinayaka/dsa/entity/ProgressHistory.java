package com.vinayaka.dsa.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "progress_history")
public class ProgressHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private int totalSolved;

    public ProgressHistory() {
    }

    public ProgressHistory(
            Long userId,
            LocalDate date,
            int totalSolved) {

        this.userId = userId;
        this.date = date;
        this.totalSolved = totalSolved;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDate getDate() {
        return date;
    }

    public int getTotalSolved() {
        return totalSolved;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setTotalSolved(int totalSolved) {
        this.totalSolved = totalSolved;
    }
}