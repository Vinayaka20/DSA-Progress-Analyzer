package com.vinayaka.dsa.controller;

import com.vinayaka.dsa.service.GitHubAccountService;
import org.springframework.web.bind.annotation.RestController;
import com.vinayaka.dsa.entity.GitHubAccount;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.vinayaka.dsa.GitHubRepositoryResponse;
import com.vinayaka.dsa.GitHubContentResponse;
import com.vinayaka.dsa.DSAProgressResponse;
import com.vinayaka.dsa.DSAProblemResponse;
import com.vinayaka.dsa.LeetCodeProblemResponse;
import com.vinayaka.dsa.TopicProgressResponse;
import com.vinayaka.dsa.DifficultyProgressResponse;
import com.vinayaka.dsa.entity.Problem;
import java.util.List;
import com.vinayaka.dsa.SolvedProblemResponse;
import com.vinayaka.dsa.entity.ProgressHistory;
import com.vinayaka.dsa.DashboardResponse;

@RestController
public class GitHubAccountController {

    private final GitHubAccountService gitHubAccountService;

    public GitHubAccountController(GitHubAccountService gitHubAccountService) {
        this.gitHubAccountService = gitHubAccountService;
    }

    @PostMapping("/github-accounts")
    public GitHubAccount createGitHubAccount(
            @RequestBody GitHubAccount gitHubAccount) {

        return gitHubAccountService.createGitHubAccount(gitHubAccount);
    }

    @GetMapping("/users/{userId}/github-accounts")
    public List<GitHubAccount> getGitHubAccountsByUserId(
            @PathVariable Long userId) {

        return gitHubAccountService.getGitHubAccountsByUserId(userId);
    }

    @GetMapping("/users/{userId}/github-connected")
    public boolean isGitHubConnected(@PathVariable Long userId) {
        return gitHubAccountService.isGitHubConnected(userId);
    }

    @DeleteMapping("/github-accounts/{id}")
    public void deleteGitHubAccount(@PathVariable Long id) {
        gitHubAccountService.deleteGitHubAccount(id);
    }

    @PutMapping("/github-accounts/{id}/repository")
    public GitHubAccount updateRepository(
            @PathVariable Long id,
            @RequestParam String repositoryName) {

        return gitHubAccountService.updateRepository(id, repositoryName);
    }

    @GetMapping("/users/{userId}/github-repositories")
    public List<GitHubRepositoryResponse> getGitHubRepositories(
            @PathVariable Long userId) {

        return gitHubAccountService.getRepositoriesByUserId(userId);
    }

    @GetMapping("/users/{userId}/selected-repository/contents")
    public List<GitHubContentResponse> getSelectedRepositoryContents(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getSelectedRepositoryContents(userId);
    }

    @GetMapping("/users/{userId}/dsa-progress")
    public DSAProgressResponse getDSAProgress(
            @PathVariable Long userId) {

        return gitHubAccountService.getDSAProgress(userId);
    }

    @GetMapping("/users/{userId}/solved-github-problems")
    public List<DSAProblemResponse> getSolvedProblemsFromGitHub(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getSolvedProblemsFromGitHub(userId);
    }
    @GetMapping("/leetcode/problem/{problemNumber}")
    public LeetCodeProblemResponse getLeetCodeProblem(
            @PathVariable String problemNumber) {

        return gitHubAccountService
                .getLeetCodeProblem(problemNumber);
    }

    @GetMapping("/users/{userId}/topic-progress-github")
    public List<TopicProgressResponse> getTopicProgressFromGitHub(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getTopicProgressFromGitHub(userId);
    }

    @GetMapping("/users/{userId}/difficulty-progress-github")
    public List<DifficultyProgressResponse> getDifficultyProgressFromGitHub(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getDifficultyProgressFromGitHub(userId);
    }

    @GetMapping("/users/{userId}/solved-problems-db")
    public List<SolvedProblemResponse> getSolvedProblemsFromDatabase(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getSolvedProblemsFromDatabase(userId);
    }

    @PostMapping("/users/{userId}/sync")
    public String syncUserProblems(@PathVariable Long userId) {

        gitHubAccountService.getSolvedProblemsFromGitHub(userId);

        gitHubAccountService.saveProgressHistory(userId);

        return "Problems synced successfully";
    }

    @GetMapping("/users/{userId}/difficulty-progress-db")
    public List<DifficultyProgressResponse> getDifficultyProgressFromDatabase(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getDifficultyProgressFromDatabase(userId);
    }

    @GetMapping("/users/{userId}/topic-progress-db")
    public List<TopicProgressResponse> getTopicProgressFromDatabase(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getTopicProgressFromDatabase(userId);
    }

    @GetMapping("/users/{userId}/progress-db")
    public DSAProgressResponse getDSAProgressFromDatabase(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getDSAProgressFromDatabase(userId);
    }

    @GetMapping("/users/{userId}/progress-history")
    public List<ProgressHistory> getProgressHistory(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getProgressHistory(userId);
    }

    @GetMapping("/users/{userId}/dashboard")
    public DashboardResponse getDashboard(
            @PathVariable Long userId) {

        return gitHubAccountService
                .getDashboard(userId);
    }

    @GetMapping("/users/{userId}/ai-data")
    public String getAIAnalysisData(
            @PathVariable Long userId) {

        return gitHubAccountService
                .buildAIAnalysisData(userId);
    }





}