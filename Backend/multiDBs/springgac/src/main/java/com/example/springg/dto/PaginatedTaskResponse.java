package com.example.springg.dto;

import com.example.springg.model.primary.Task;
import java.util.List;

public class PaginatedTaskResponse {
    private List<Task> tasks;
    private int totalCount;
    private long lastUpdated;

    // ✅ Default no-argument constructor (required for Jackson)
    public PaginatedTaskResponse() {
    }

    public PaginatedTaskResponse(List<Task> tasks, int totalCount) {
        this.tasks = tasks;
        this.totalCount = totalCount;
        this.lastUpdated = System.currentTimeMillis();
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public long getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(long lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}









//package com.example.springg.dto;
//
//import com.example.springg.model.primary.Task;
//import java.util.List;
//
//public class PaginatedTaskResponse {
//    private List<Task> tasks;
//    private int totalCount;
//
//    public PaginatedTaskResponse(List<Task> tasks, int totalCount) {
//        this.tasks = tasks;
//        this.totalCount = totalCount;
//    }
//
//    public List<Task> getTasks() {
//        return tasks;
//    }
//
//    public void setTasks(List<Task> tasks) {
//        this.tasks = tasks;
//    }
//
//    public int getTotalCount() {
//        return totalCount;
//    }
//
//    public void setTotalCount(int totalCount) {
//        this.totalCount = totalCount;
//    }
//}
//
//
//
