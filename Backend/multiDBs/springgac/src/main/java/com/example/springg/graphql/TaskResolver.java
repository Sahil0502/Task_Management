package com.example.springg.graphql;

import com.example.springg.dto.PaginatedTaskResponse;
import com.example.springg.service.TaskService;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class TaskResolver {
    private final TaskService taskService;

    public TaskResolver(TaskService taskService) {
        this.taskService = taskService;
    }

    // Unified paginated task query with default values
    @QueryMapping
    public PaginatedTaskResponse getPaginatedTasks(@Argument Integer page, @Argument Integer size) {
        int p = (page != null) ? page : 0;
        int s = (size != null) ? size : 25;
        return taskService.getPaginatedTasks(p, s);
    }

    // Separate endpoint for total count to avoid unnecessary data fetching
    @QueryMapping
    public int getTotalTasksCount() {
        return taskService.getTotalTasksCount();
    }
}






//package com.example.springg.graphql;
//
//
//import com.example.springg.dto.PaginatedTaskResponse;
//import com.example.springg.service.TaskService;
//
//
//import org.springframework.graphql.data.method.annotation.Argument;
//import org.springframework.graphql.data.method.annotation.QueryMapping;
//import org.springframework.stereotype.Controller;
//
//
//@Controller
//public class TaskResolver {
//
//
//    private final TaskService taskService;
//
//
//    public TaskResolver(TaskService taskService) {
//        this.taskService = taskService;
//    }
//
//
//    // Unified paginated task query
//    @QueryMapping
//    public PaginatedTaskResponse getPaginatedTasks(@Argument Integer page, @Argument Integer size) {
//        int p = (page != null) ? page : 0;
//        int s = (size != null) ? size : 25;
//        return taskService.getPaginatedTasks(p, s);
//    }
//
//
//    // Optional: Still expose total count if frontend needs it separately
//    @QueryMapping
//    public int getTotalTasksCount() {
//        return taskService.getPaginatedTasks(0, Integer.MAX_VALUE).getTotalCount();
//    }
//}
//
//
//
//
//
