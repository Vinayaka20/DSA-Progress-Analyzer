package com.vinayaka.dsa.service;

import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserGoals;
import com.vinayaka.dsa.repository.UserGoalsRepository;
import com.vinayaka.dsa.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserGoalsService {

    private final UserGoalsRepository userGoalsRepository;
    private final UserRepository userRepository;

    public UserGoalsService(
            UserGoalsRepository userGoalsRepository,
            UserRepository userRepository) {

        this.userGoalsRepository = userGoalsRepository;
        this.userRepository = userRepository;
    }

    public UserGoals getUserGoals(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return userGoalsRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Goals not found"));
    }

    public UserGoals updateUserGoals(
            Long userId,
            Integer weeklyGoal,
            Integer monthlyGoal,
            Integer targetGoal) {

        UserGoals goals = getUserGoals(userId);

        goals.setWeeklyGoal(weeklyGoal);
        goals.setMonthlyGoal(monthlyGoal);
        goals.setTargetGoal(targetGoal);

        return userGoalsRepository.save(goals);
    }
}