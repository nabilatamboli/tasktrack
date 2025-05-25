package com.tasktrack.tasktrack.controller;

import com.tasktrack.tasktrack.model.Task;
import com.tasktrack.tasktrack.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // Get all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    // Get task by ID
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Optional<Task> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new task
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
    }

    // Update a task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<Task> existingTaskOpt = taskService.getTaskById(id);

        if (existingTaskOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Task task = existingTaskOpt.get();

        // Update only the provided fields
        if (updates.containsKey("title")) {
            task.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            task.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("completed")) {
            Object completedValue = updates.get("completed");
            if (completedValue instanceof Boolean) {
                task.setCompleted((Boolean) completedValue);
            } else if (completedValue instanceof Number) {
                task.setCompleted(((Number) completedValue).intValue() == 1);
            }
        }
        if (updates.containsKey("status")) {
            task.setStatus((String) updates.get("status"));
        }

        Task updatedTask = taskService.updateTask(id, task);
        return ResponseEntity.ok(updatedTask);
    }

    // Delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
