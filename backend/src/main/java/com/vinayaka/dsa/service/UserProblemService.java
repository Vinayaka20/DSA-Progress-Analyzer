package com.vinayaka.dsa.service;

import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserProblem;
import com.vinayaka.dsa.repository.UserProblemRepository;
import com.vinayaka.dsa.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.vinayaka.dsa.ProgressResponse;
import com.vinayaka.dsa.entity.Problem;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.time.LocalDate;
import java.util.TreeSet;

@Service
public class UserProblemService {

    private final UserProblemRepository userProblemRepository;
    private final UserRepository userRepository;

    public UserProblemService(
            UserProblemRepository userProblemRepository,
            UserRepository userRepository) {

        this.userProblemRepository = userProblemRepository;
        this.userRepository = userRepository;
    }

    public UserProblem createUserProblem(UserProblem userProblem) {
        return userProblemRepository.save(userProblem);
    }

    public List<UserProblem> getAllUserProblems() {
        return userProblemRepository.findAll();
    }

    public List<UserProblem> getProblemsByUserId(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return List.of();
        }

        return userProblemRepository.findByUser(user);
    }

    public long getTotalSolved(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return 0;
        }

        return userProblemRepository.findByUser(user).size();
    }

    public ProgressResponse getProgress(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return new ProgressResponse(0, 0, 0, 0);
        }

        List<UserProblem> userProblems =
                userProblemRepository.findByUser(user);

        long totalSolved = userProblems.size();

        long easy = userProblems.stream()
                .filter(up ->
                        up.getProblem()
                                .getDifficulty()
                                .equalsIgnoreCase("Easy"))
                .count();

        long medium = userProblems.stream()
                .filter(up ->
                        up.getProblem()
                                .getDifficulty()
                                .equalsIgnoreCase("Medium"))
                .count();

        long hard = userProblems.stream()
                .filter(up ->
                        up.getProblem()
                                .getDifficulty()
                                .equalsIgnoreCase("Hard"))
                .count();

        return new ProgressResponse(
                totalSolved,
                easy,
                medium,
                hard
        );
    }

    public Map<String, Long> getTopicProgress(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        Map<String, Long> topicProgress = new HashMap<>();

        if (user == null) {
            return topicProgress;
        }

        List<UserProblem> userProblems =
                userProblemRepository.findByUser(user);

        for (UserProblem userProblem : userProblems) {

            String topic = userProblem.getProblem().getTopic();

            topicProgress.put(
                    topic,
                    topicProgress.getOrDefault(topic, 0L) + 1
            );
        }

        return topicProgress;
    }

    public List<Problem> getSolvedProblemsByUserId(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return List.of();
        }

        List<UserProblem> userProblems =
                userProblemRepository.findByUser(user);

        return userProblems.stream()
                .map(UserProblem::getProblem)
                .toList();
    }

    // ============================================================
    // STREAK CALCULATION
    // ============================================================

    public Map<String, Long> getStreak(Long userId) {

        Map<String, Long> result = new HashMap<>();

        // Default values
        result.put("currentStreak", 0L);
        result.put("longestStreak", 0L);

        // Find user
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return result;
        }

        // Get all solved problems for this user
        List<UserProblem> userProblems =
                userProblemRepository.findByUser(user);

        /*
         * TreeSet automatically:
         *
         * 1. Removes duplicate dates
         * 2. Sorts dates in ascending order
         *
         * Example:
         *
         * 2026-09-28
         * 2026-09-28
         * 2026-09-29
         * 2026-09-30
         *
         * becomes:
         *
         * 2026-09-28
         * 2026-09-29
         * 2026-09-30
         *
         * This is important because multiple problems solved
         * on the same day should count as ONE streak day.
         */
        TreeSet<LocalDate> solvedDates = new TreeSet<>();

        for (UserProblem userProblem : userProblems) {

            if (userProblem.getSolvedDate() != null) {

                solvedDates.add(
                        userProblem.getSolvedDate()
                );
            }
        }

        // No solved dates
        if (solvedDates.isEmpty()) {
            return result;
        }

        // ========================================================
        // CALCULATE LONGEST STREAK
        // ========================================================

        long longestStreak = 1;
        long currentLongest = 1;

        LocalDate previousDate = null;

        for (LocalDate date : solvedDates) {

            // Skip comparison for the first date
            if (previousDate != null) {

                /*
                 * Check whether the current date is exactly
                 * one day after the previous date.
                 */
                if (date.equals(previousDate.plusDays(1))) {

                    currentLongest++;

                } else {

                    /*
                     * Gap found.
                     * Start a new streak.
                     */
                    currentLongest = 1;
                }

                // Keep the maximum streak found
                longestStreak =
                        Math.max(
                                longestStreak,
                                currentLongest
                        );
            }

            previousDate = date;
        }

        // ========================================================
        // CALCULATE CURRENT STREAK
        // ========================================================

        /*
         * The latest solved date is the last date
         * in the TreeSet.
         */
        LocalDate latestDate = solvedDates.last();

        LocalDate today = LocalDate.now();

        /*
         * Find how many days have passed since
         * the latest solution.
         */
        long daysSinceLatest =
                java.time.temporal.ChronoUnit.DAYS.between(
                        latestDate,
                        today
                );

        long currentStreak = 0;

        /*
         * Current streak is active when the user solved
         * something either:
         *
         * - Today
         * - Yesterday
         */
        if (daysSinceLatest == 0 || daysSinceLatest == 1) {

            currentStreak = 1;

            /*
             * Start checking backwards from the day
             * before the latest solved date.
             */
            LocalDate date =
                    latestDate.minusDays(1);

            /*
             * Continue while every previous calendar day
             * has at least one solved problem.
             */
            while (solvedDates.contains(date)) {

                currentStreak++;

                date = date.minusDays(1);
            }
        }

        // Store results
        result.put(
                "currentStreak",
                currentStreak
        );

        result.put(
                "longestStreak",
                longestStreak
        );

        return result;
    }
}