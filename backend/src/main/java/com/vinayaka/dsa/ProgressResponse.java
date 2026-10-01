package com.vinayaka.dsa;

public class ProgressResponse {

    private long totalSolved;
    private long easy;
    private long medium;
    private long hard;

    public ProgressResponse(long totalSolved, long easy,
                            long medium, long hard) {
        this.totalSolved = totalSolved;
        this.easy = easy;
        this.medium = medium;
        this.hard = hard;
    }

    public long getTotalSolved() {
        return totalSolved;
    }

    public long getEasy() {
        return easy;
    }

    public long getMedium() {
        return medium;
    }

    public long getHard() {
        return hard;
    }
}