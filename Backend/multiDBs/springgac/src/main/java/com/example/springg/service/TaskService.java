package com.example.springg.service;

import com.example.springg.dto.PaginatedTaskResponse;
import com.example.springg.model.Eight.Task8;
import com.example.springg.model.Fifth.Task5;
import com.example.springg.model.Fourth.Task4;
import com.example.springg.model.Nine.Task9;
import com.example.springg.model.Seven.Task7;
import com.example.springg.model.Six.Task6;
import com.example.springg.model.Ten.Task10;
import com.example.springg.model.Third.Task3;
import com.example.springg.model.primary.Task;
import com.example.springg.model.secondary.Task2;
import com.example.springg.repository.Eight.Task8Repository;
import com.example.springg.repository.Fifth.Task5Repository;
import com.example.springg.repository.Fourth.Task4Repository;
import com.example.springg.repository.Nine.Task9Repository;
import com.example.springg.repository.Seven.Task7Repository;
import com.example.springg.repository.Six.Task6Repository;
import com.example.springg.repository.Ten.Task10Repository;
import com.example.springg.repository.Third.Task3Repository;
import com.example.springg.repository.primary.TaskRepository;
import com.example.springg.repository.secondary.Task2Repository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final Task2Repository task2Repository;
    private final Task3Repository task3Repository;
    private final Task4Repository task4Repository;
    private final Task5Repository task5Repository;
    private final Task6Repository task6Repository;
    private final Task7Repository task7Repository;
    private final Task8Repository task8Repository;
    private final Task9Repository task9Repository;
    private final Task10Repository task10Repository;

    public TaskService(TaskRepository taskRepository, Task2Repository task2Repository, Task3Repository task3Repository,
                       Task4Repository task4Repository, Task5Repository task5Repository, Task6Repository task6Repository,
                       Task7Repository task7Repository, Task8Repository task8Repository, Task9Repository task9Repository,
                       Task10Repository task10Repository) {
        this.taskRepository = taskRepository;
        this.task2Repository = task2Repository;
        this.task3Repository = task3Repository;
        this.task4Repository = task4Repository;
        this.task5Repository = task5Repository;
        this.task6Repository = task6Repository;
        this.task7Repository = task7Repository;
        this.task8Repository = task8Repository;
        this.task9Repository = task9Repository;
        this.task10Repository = task10Repository;
    }

    /**
     * Get cached count of total tasks across all repositories
     * This avoids repeatedly counting all tasks when paginating
     */
    @Cacheable(value = "tasksCount", key = "'totalCount'")
    public int getTotalTasksCount() {
        logger.info("Calculating total task count across all repositories");
        return (int) (taskRepository.count() +
                task2Repository.count() +
                task3Repository.count() +
                task4Repository.count() +
                task5Repository.count() +
                task6Repository.count() +
                task7Repository.count() +
                task8Repository.count() +
                task9Repository.count() +
                task10Repository.count());
    }

    /**
     * Cache paginated results with page and size as the key
     * This significantly improves performance for frequently accessed pages
     */
    @Cacheable(value = "tasksPaginated", key = "#page + '-' + #size")
    public PaginatedTaskResponse getPaginatedTasks(int page, int size) {
        logger.info("Fetching paginated tasks for page {} with size {}", page, size);

        int totalCount = getTotalTasksCount();
        List<Task> pagedTasks = getPagedTasksFromAllDatabases(page, size);

        // Sort by received date descending
        pagedTasks.sort(Comparator.comparing(Task::getReceivedDate, Comparator.nullsLast(Comparator.reverseOrder())));

        // Create response with timestamp
        PaginatedTaskResponse response = new PaginatedTaskResponse(pagedTasks, totalCount);
        logger.info("Returning {} tasks for page {}", pagedTasks.size(), page);
        return response;
    }

    /**
     * Evict all cached paginated results and count
     * Called on scheduled refresh or manual refresh
     */
    @CacheEvict(cacheNames = {"tasksPaginated", "tasksCount"}, allEntries = true)
    public void refreshTasksCache() {
        logger.info("Refreshing tasks cache");
    }

    /**
     * Helper method to get tasks from all databases with more efficient pagination
     * Uses a weighted approach to fetch from each repository based on page
     */
    private List<Task> getPagedTasksFromAllDatabases(int page, int size) {
        List<Task> results = new ArrayList<>();

        // Calculate per-repository page size based on desired total size plus some buffer
        // We'll fetch a bit more than needed to ensure we have enough after merging
        int repoPageSize = (size / 10) + 2;
        Pageable pageable = PageRequest.of(page, repoPageSize);

        // Fetch from all repositories using database pagination
        results.addAll(taskRepository.findAll(pageable).getContent().stream()
                .peek(t -> t.setCustomer("CUSTOMER1"))
                .collect(Collectors.toList()));

        results.addAll(task2Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER2"))
                .collect(Collectors.toList()));

        results.addAll(task3Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER3"))
                .collect(Collectors.toList()));

        results.addAll(task4Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER4"))
                .collect(Collectors.toList()));

        results.addAll(task5Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER5"))
                .collect(Collectors.toList()));

        results.addAll(task6Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER6"))
                .collect(Collectors.toList()));

        results.addAll(task7Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER7"))
                .collect(Collectors.toList()));

        results.addAll(task8Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER8"))
                .collect(Collectors.toList()));

        results.addAll(task9Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER9"))
                .collect(Collectors.toList()));

        results.addAll(task10Repository.findAll(pageable).stream()
                .map(t -> mapToCommonTask(t, "CUSTOMER10"))
                .collect(Collectors.toList()));

        // After combining, limit to the requested size
        if (results.size() > size) {
            return results.subList(0, size);
        }

        return results;
    }

    private Task mapToCommonTask(Object obj, String customerName) {
        if (obj instanceof Task2 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task3 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task4 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task5 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task6 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task7 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task8 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task9 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        } else if (obj instanceof Task10 t) {
            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
            task.setCustomer(customerName);
            return task;
        }
        return null;
    }

    @PostConstruct
    public void testCount() {
        logger.info("Total tasks count: {}", getTotalTasksCount());
    }
}






//package com.example.springg.service;
//
//import com.example.springg.dto.PaginatedTaskResponse;
//import com.example.springg.model.Eight.Task8;
//import com.example.springg.model.Fifth.Task5;
//import com.example.springg.model.Fourth.Task4;
//import com.example.springg.model.Nine.Task9;
//import com.example.springg.model.Seven.Task7;
//import com.example.springg.model.Six.Task6;
//import com.example.springg.model.Ten.Task10;
//import com.example.springg.model.Third.Task3;
//import com.example.springg.model.primary.Task;
//import com.example.springg.model.secondary.Task2;
//import com.example.springg.repository.Eight.Task8Repository;
//import com.example.springg.repository.Fifth.Task5Repository;
//import com.example.springg.repository.Fourth.Task4Repository;
//import com.example.springg.repository.Nine.Task9Repository;
//import com.example.springg.repository.Seven.Task7Repository;
//import com.example.springg.repository.Six.Task6Repository;
//import com.example.springg.repository.Ten.Task10Repository;
//import com.example.springg.repository.Third.Task3Repository;
//import com.example.springg.repository.primary.TaskRepository;
//import com.example.springg.repository.secondary.Task2Repository;
//import jakarta.annotation.PostConstruct;
//import org.springframework.cache.annotation.Cacheable;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.scheduling.annotation.Async;
//import org.springframework.stereotype.Service;
//
//import java.util.ArrayList;
//import java.util.Comparator;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class TaskService {
//    private final TaskRepository taskRepository;
//    private final Task2Repository task2Repository;
//    private final Task3Repository task3Repository;
//    private final Task4Repository task4Repository;
//    private final Task5Repository task5Repository;
//    private final Task6Repository task6Repository;
//    private final Task7Repository task7Repository;
//    private final Task8Repository task8Repository;
//    private final Task9Repository task9Repository;
//    private final Task10Repository task10Repository;
//
//    public TaskService(TaskRepository taskRepository, Task2Repository task2Repository, Task3Repository task3Repository,
//                       Task4Repository task4Repository, Task5Repository task5Repository, Task6Repository task6Repository,
//                       Task7Repository task7Repository, Task8Repository task8Repository, Task9Repository task9Repository,
//                       Task10Repository task10Repository) {
//        this.taskRepository = taskRepository;
//        this.task2Repository = task2Repository;
//        this.task3Repository = task3Repository;
//        this.task4Repository = task4Repository;
//        this.task5Repository = task5Repository;
//        this.task6Repository = task6Repository;
//        this.task7Repository = task7Repository;
//        this.task8Repository = task8Repository;
//        this.task9Repository = task9Repository;
//        this.task10Repository = task10Repository;
//    }
//
//    public PaginatedTaskResponse getPaginatedTasks(int page, int size) {
//        List<Task> allTasks = new ArrayList<>();
//
//        allTasks.addAll(taskRepository.findAll().stream()
//                .peek(t -> t.setCustomer("CUSTOMER1"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task2Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER2"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task3Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER3"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task4Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER4"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task5Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER5"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task6Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER6"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task7Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER7"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task8Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER8"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task9Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER9"))
//                .collect(Collectors.toList()));
//
//        allTasks.addAll(task10Repository.findAll().stream()
//                .map(t -> mapToCommonTask(t, "CUSTOMER10"))
//                .collect(Collectors.toList()));
//
//        // Optional: sort by received date descending
//        allTasks.sort(Comparator.comparing(Task::getReceivedDate, Comparator.nullsLast(Comparator.reverseOrder())));
//
//        int totalCount = allTasks.size();
//        int start = page * size;
//        int end = Math.min(start + size, totalCount);
//
//        List<Task> pagedTasks = allTasks.subList(start, end);
//
//        return new PaginatedTaskResponse(pagedTasks, totalCount);
//    }
//
//    private Task mapToCommonTask(Object obj, String customerName) {
//        if (obj instanceof Task2 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        } else if (obj instanceof Task3 t) {
//            // Repeat logic for all other task types...
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        } else if (obj instanceof Task4 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        }
//        // Add Task5–Task10 similarly
//        else if (obj instanceof Task5 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        } else if (obj instanceof Task6 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        } else if (obj instanceof Task7 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        } else if (obj instanceof Task8 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        } else if (obj instanceof Task9 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        } else if (obj instanceof Task10 t) {
//            Task task = new Task(t.getId(), t.getJid(), t.getDueDate(), t.getArticleId(), t.getReceivedDate(),
//                    t.getJournalComplexity(), t.getDepartment(), t.getTaskId(), t.getTaskName(), t.getUser());
//            task.setCustomer(customerName);
//            return task;
//        }
//        return null;
//    }
//
//    @PostConstruct
//    public void testCount() {
//        System.out.println("Total tasks count: " + getPaginatedTasks(0, Integer.MAX_VALUE).getTotalCount());
//    }
//}
//
//
//
