package com.vinayaka.dsa;

public class DifficultyProgressResponse {

    private String difficulty;
    private int solvedCount;

    public DifficultyProgressResponse(
            String difficulty,
            int solvedCount) {
        this.difficulty = difficulty;
        this.solvedCount = solvedCount;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public int getSolvedCount() {
        return solvedCount;
    }
}