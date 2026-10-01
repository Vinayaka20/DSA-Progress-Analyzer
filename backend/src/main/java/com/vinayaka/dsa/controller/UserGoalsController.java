package com.vinayaka.dsa.controller;

import com.vinayaka.dsa.UserGoalsResponse;
import com.vinayaka.dsa.UpdateUserGoalsRequest;
import com.vinayaka.dsa.entity.UserGoals;
import com.vinayaka.dsa.service.UserGoalsService;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserGoalsController {

    private final UserGoalsService userGoalsService;

    public UserGoalsController(UserGoalsService userGoalsService) {
        this.userGoalsService = userGoalsService;
    }

    @GetMapping("/users/{userId}/goals")
    public UserGoalsResponse getUserGoals(
            @PathVariable Long userId) {

        UserGoals goals =
                userGoalsService.getUserGoals(userId);

        return new UserGoalsResponse(
                goals.getWeeklyGoal(),
                goals.getMonthlyGoal(),
                goals.getTargetGoal()
        );
    }

    @PutMapping("/users/{userId}/goals")
    public UserGoalsResponse updateUserGoals(
            @PathVariable Long userId,
            @RequestBody UpdateUserGoalsRequest request) {

        UserGoals goals =
                userGoalsService.updateUserGoals(
                        userId,
                        request.getWeeklyGoal(),
                        request.getMonthlyGoal(),
                        request.getTargetGoal()
                );

        return new UserGoalsResponse(
                goals.getWeeklyGoal(),
                goals.getMonthlyGoal(),
                goals.getTargetGoal()
        );
    }
}


