package com.example.springg.config;

import com.example.springg.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class CacheScheduler {
    private static final Logger logger = LoggerFactory.getLogger(CacheScheduler.class);

    private final TaskService taskService;

    public CacheScheduler(TaskService taskService) {
        this.taskService = taskService;
    }

    @Scheduled(fixedRate = 60000) // Every 60 seconds to match frontend cache expiration
    public void refreshTaskCache() {
        logger.info("Running scheduled cache refresh");
        taskService.refreshTasksCache();
    }
}
