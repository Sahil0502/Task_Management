//package com.example.springg.graphql;
//
//import com.example.springg.model.primary.Task;
//import com.example.springg.repository.primary.TaskRepository;
//import graphql.kickstart.tools.GraphQLSubscriptionResolver;
//import org.reactivestreams.Publisher;
//import org.springframework.stereotype.Component;
//import reactor.core.publisher.Sinks;
//
//@Component
//public class TaskSubscriptionResolver implements GraphQLSubscriptionResolver {
//
//    private final Sinks.Many<Task> taskSink = Sinks.many().multicast().onBackpressureBuffer();
//    private final TaskRepository taskRepository;
//
//    public TaskSubscriptionResolver(TaskRepository taskRepository) {
//        this.taskRepository = taskRepository;
//    }
//
//    public Publisher<Task> taskUpdates() {
//        return taskSink.asFlux();
//    }
//
//    public void notifyTaskUpdates(Task task) {
//        taskSink.tryEmitNext(task);
//    }
//}
