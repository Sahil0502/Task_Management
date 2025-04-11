package com.example.springg.model;

public class TaskStats {
    private int total;

    public TaskStats() {
    }

    public TaskStats(int total) {
        this.total = total;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    @Override
    public String toString() {
        return "TaskStats{total=" + total + "}";
    }
}
