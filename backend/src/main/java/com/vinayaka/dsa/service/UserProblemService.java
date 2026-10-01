package com.vinayaka.dsa.service;

import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserProblem;
import com.vinayaka.dsa.repository.UserProblemRepository;
import com.vinayaka.dsa.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.vinayaka.dsa.ProgressResponse;
import java.util.Map;
import java.util.HashMap;
import com.vinayaka.dsa.entity.Problem;

import java.util.List;

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
                .filter(up -> up.getProblem().getDifficulty().equalsIgnoreCase("Easy"))
                .count();

        long medium = userProblems.stream()
                .filter(up -> up.getProblem().getDifficulty().equalsIgnoreCase("Medium"))
                .count();

        long hard = userProblems.stream()
                .filter(up -> up.getProblem().getDifficulty().equalsIgnoreCase("Hard"))
                .count();

        return new ProgressResponse(totalSolved, easy, medium, hard);
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
}