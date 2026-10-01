package com.vinayaka.dsa.service;
import java.util.List;
import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.vinayaka.dsa.SettingsResponse;
import com.vinayaka.dsa.entity.UserGoals;
import com.vinayaka.dsa.entity.GitHubAccount;
import com.vinayaka.dsa.repository.UserGoalsRepository;
import com.vinayaka.dsa.repository.GitHubAccountRepository;
import com.vinayaka.dsa.SettingsRequest;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final UserGoalsService userGoalsService;
    private final GitHubAccountService gitHubAccountService;

    public UserService(
            UserRepository userRepository,
            UserGoalsService userGoalsService,
            GitHubAccountService gitHubAccountService) {

        this.userRepository = userRepository;
        this.userGoalsService = userGoalsService;
        this.gitHubAccountService = gitHubAccountService;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id).orElse(null);

        if (existingUser != null) {
            existingUser.setName(user.getName());
            existingUser.setEmail(user.getEmail());
            existingUser.setPassword(user.getPassword());

            return userRepository.save(existingUser);
        }

        return null;
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public SettingsResponse getSettings(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserGoals goals = userGoalsService.getUserGoals(userId);

        GitHubAccount account = gitHubAccountService
                .getGitHubAccountsByUserId(userId)
                .stream()
                .findFirst()
                .orElse(null);

        SettingsResponse response = new SettingsResponse();

        response.setName(user.getName());
        response.setEmail(user.getEmail());

        if (account != null) {
            response.setConnected(true);
            response.setGithubUsername(account.getGithubUsername());
            response.setRepositoryName(account.getRepositoryName());
        } else {
            response.setConnected(false);
        }

        response.setWeeklyGoal(goals.getWeeklyGoal());
        response.setMonthlyGoal(goals.getMonthlyGoal());
        response.setTargetGoal(goals.getTargetGoal());

        return response;
    }

    public SettingsResponse updateSettings(Long userId, SettingsRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // -------- Profile --------

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required.");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required.");
        }

        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new RuntimeException("Enter a valid email.");
        }

        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim());

        userRepository.save(user);

        // -------- Goals --------

        UserGoals goals = userGoalsService.getUserGoals(userId);

        goals.setWeeklyGoal(request.getWeeklyGoal());
        goals.setMonthlyGoal(request.getMonthlyGoal());
        goals.setTargetGoal(request.getTargetGoal());

        userGoalsService.updateUserGoals(
                userId,
                request.getWeeklyGoal(),
                request.getMonthlyGoal(),
                request.getTargetGoal()
        );

        // -------- GitHub Repository --------

        GitHubAccount account = gitHubAccountService
                .getGitHubAccountsByUserId(userId)
                .stream()
                .findFirst()
                .orElse(null);

        if (account != null &&
                request.getRepositoryName() != null &&
                !request.getRepositoryName().isBlank()) {

            account.setRepositoryName(request.getRepositoryName().trim());

            gitHubAccountService.save(account);
        }

        return getSettings(userId);
    }
}
