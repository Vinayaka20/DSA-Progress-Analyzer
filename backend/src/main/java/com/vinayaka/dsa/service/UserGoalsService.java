package com.vinayaka.dsa.service;

import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserGoals;
import com.vinayaka.dsa.repository.ProblemRepository;
import com.vinayaka.dsa.repository.UserGoalsRepository;
import com.vinayaka.dsa.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class UserGoalsService {

    private final UserGoalsRepository userGoalsRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;

    public UserGoalsService(
            UserGoalsRepository userGoalsRepository,
            UserRepository userRepository,
            ProblemRepository problemRepository) {

        this.userGoalsRepository = userGoalsRepository;
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
    }

    public UserGoals getUserGoals(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        UserGoals goals = userGoalsRepository.findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Goals not found"));

        initializeCyclesIfNeeded(goals, user);

        return goals;
    }

    private void initializeCyclesIfNeeded(UserGoals goals, User user) {

        boolean changed = false;

        long currentSolved =
                problemRepository.countSolvedProblemsByUser(user);

        LocalDate today = LocalDate.now();

        // =========================
        // WEEKLY 7-DAY CYCLE
        // =========================

        if (goals.getWeeklyStartDate() == null) {

            goals.setWeeklyStartDate(today);
            goals.setWeeklyStartSolved((int) currentSolved);

            changed = true;

        } else {

            int weeklySolved =
                    (int) currentSolved - goals.getWeeklyStartSolved();

            weeklySolved = Math.max(weeklySolved, 0);

            LocalDate weeklyEndDate =
                    goals.getWeeklyStartDate().plusDays(6);

            boolean weeklyGoalCompleted =
                    weeklySolved >= goals.getWeeklyGoal();

            boolean weeklyTimeExpired =
                    today.isAfter(weeklyEndDate);

            if (weeklyGoalCompleted || weeklyTimeExpired) {

                goals.setPreviousWeeklySolved(weeklySolved);

                goals.setPreviousWeeklyCompleted(
                        weeklyGoalCompleted
                );

                goals.setWeeklyStartDate(today);
                goals.setWeeklyStartSolved((int) currentSolved);

                changed = true;
            }
        }


        // =========================
        // 30-DAY CYCLE
        // =========================

        if (goals.getMonthlyStartDate() == null) {

            goals.setMonthlyStartDate(today);
            goals.setMonthlyStartSolved((int) currentSolved);

            changed = true;

        } else {

            int monthlySolved =
                    (int) currentSolved - goals.getMonthlyStartSolved();

            monthlySolved = Math.max(monthlySolved, 0);

            LocalDate monthlyEndDate =
                    goals.getMonthlyStartDate().plusDays(29);

            boolean monthlyGoalCompleted =
                    monthlySolved >= goals.getMonthlyGoal();

            boolean monthlyTimeExpired =
                    today.isAfter(monthlyEndDate);

            if (monthlyGoalCompleted || monthlyTimeExpired) {

                goals.setPreviousMonthlySolved(monthlySolved);

                goals.setPreviousMonthlyCompleted(
                        monthlyGoalCompleted
                );

                goals.setMonthlyStartDate(today);
                goals.setMonthlyStartSolved((int) currentSolved);

                changed = true;
            }
        }


        if (changed) {
            userGoalsRepository.save(goals);
        }
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