package com.example.springg.controller;

import com.example.springg.dto.PaginatedTaskResponse;
import com.example.springg.service.TaskService;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@Controller
public class GraphQLController {

    private final TaskService taskService;

    public GraphQLController(TaskService taskService) {
        this.taskService = taskService;
    }

//    @QueryMapping
//    public PaginatedTaskResponse getPaginatedTasks(@Argument Integer page, @Argument Integer size) {
//        int p = (page != null) ? page : 0;
//        int s = (size != null) ? size : 25;
//        return taskService.getPaginatedTasks(p, s);
//    }
}


