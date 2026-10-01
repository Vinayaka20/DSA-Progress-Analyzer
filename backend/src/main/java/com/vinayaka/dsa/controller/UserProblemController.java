package com.vinayaka.dsa.controller;

import com.vinayaka.dsa.entity.UserProblem;
import com.vinayaka.dsa.service.UserProblemService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.vinayaka.dsa.ProgressResponse;
import com.vinayaka.dsa.entity.Problem;

import java.util.List;
import java.util.Map;

@RestController
public class UserProblemController {

    private final UserProblemService userProblemService;

    public UserProblemController(UserProblemService userProblemService) {
        this.userProblemService = userProblemService;
    }

    @PostMapping("/user-problems")
    public UserProblem createUserProblem(@RequestBody UserProblem userProblem) {
        return userProblemService.createUserProblem(userProblem);
    }

    @GetMapping("/user-problems")
    public List<UserProblem> getAllUserProblems() {
        return userProblemService.getAllUserProblems();
    }

    @GetMapping("/users/{userId}/problems")
    public List<UserProblem> getProblemsByUserId(
            @PathVariable Long userId) {

        return userProblemService.getProblemsByUserId(userId);
    }

    @GetMapping("/users/{userId}/progress")
    public ProgressResponse getProgress(@PathVariable Long userId) {
        return userProblemService.getProgress(userId);
    }

    @GetMapping("/users/{userId}/topic-progress")
    public Map<String, Long> getTopicProgress(
            @PathVariable Long userId) {

        return userProblemService.getTopicProgress(userId);
    }

    @GetMapping("/users/{userId}/solved-problems")
    public List<Problem> getSolvedProblemsByUserId(
            @PathVariable Long userId) {

        return userProblemService.getSolvedProblemsByUserId(userId);
    }
}