package com.vinayaka.dsa.service;

import com.vinayaka.dsa.entity.GitHubAccount;
import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.repository.GitHubAccountRepository;
import com.vinayaka.dsa.repository.UserRepository;
import org.springframework.stereotype.Service;

import com.vinayaka.dsa.GitHubRepositoryResponse;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.vinayaka.dsa.GitHubContentResponse;

import com.vinayaka.dsa.DSAProgressResponse;
import com.vinayaka.dsa.GitHubContentResponse;
import com.vinayaka.dsa.DSAProblemResponse;

import com.vinayaka.dsa.entity.Problem;
import com.vinayaka.dsa.repository.ProblemRepository;
import com.vinayaka.dsa.LeetCodeProblemResponse;
import com.vinayaka.dsa.TopicProgressResponse;
import com.vinayaka.dsa.DifficultyProgressResponse;
import com.vinayaka.dsa.repository.TopicRepository;
import com.vinayaka.dsa.entity.Topic;
import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.SolvedProblemResponse;
import com.vinayaka.dsa.repository.ProgressHistoryRepository;
import com.vinayaka.dsa.entity.ProgressHistory;
import com.vinayaka.dsa.DashboardResponse;

import java.util.ArrayList;
import java.util.Map;

import java.util.List;

@Service
public class GitHubAccountService {

    private final GitHubAccountRepository gitHubAccountRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final TopicRepository topicRepository;
    private final ProgressHistoryRepository progressHistoryRepository;

    public GitHubAccountService(
            GitHubAccountRepository gitHubAccountRepository,
            UserRepository userRepository,
            ProblemRepository problemRepository,
            TopicRepository topicRepository,
            ProgressHistoryRepository progressHistoryRepository) {

        this.gitHubAccountRepository = gitHubAccountRepository;
        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.topicRepository = topicRepository;
        this.progressHistoryRepository = progressHistoryRepository;
    }
    public GitHubAccount createGitHubAccount(GitHubAccount gitHubAccount) {
        return gitHubAccountRepository.save(gitHubAccount);
    }

    public List<GitHubAccount> getGitHubAccountsByUserId(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return List.of();
        }

        return gitHubAccountRepository.findAllByUser(user);
    }

    public boolean isGitHubConnected(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return false;
        }

        return gitHubAccountRepository.findByUser(user).isPresent();
    }

    public void deleteGitHubAccount(Long id) {
        gitHubAccountRepository.deleteById(id);
    }

    public GitHubAccount updateRepository(Long id, String repositoryName) {

        GitHubAccount githubAccount =
                gitHubAccountRepository.findById(id).orElse(null);

        if (githubAccount == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "GitHub account not found"
            );
        }

        Long userId = githubAccount.getUser().getId();

        List<GitHubRepositoryResponse> repositories =
                getRepositoriesByUserId(userId);

        boolean repositoryExists = false;

        for (GitHubRepositoryResponse repository : repositories) {

            if (repository.getName().equals(repositoryName)) {
                repositoryExists = true;
                break;
            }
        }

        if (!repositoryExists) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Repository not found or does not belong to this user"
            );
        }

        githubAccount.setRepositoryName(repositoryName);

        return gitHubAccountRepository.save(githubAccount);
    }

    public GitHubAccount getGitHubAccountByUser(User user) {
        return gitHubAccountRepository.findByUser(user).orElse(null);
    }

    public List<GitHubRepositoryResponse> getRepositoriesByUserId(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return List.of();
        }

        GitHubAccount githubAccount =
                gitHubAccountRepository.findByUser(user).orElse(null);

        if (githubAccount == null) {
            return List.of();
        }

        String accessToken = githubAccount.getAccessToken();

        RestTemplate restTemplate = new RestTemplate();

        String repositoriesUrl = "https://api.github.com/user/repos";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(
                List.of(MediaType.APPLICATION_JSON)
        );

        HttpEntity<Void> request =
                new HttpEntity<>(headers);

        ResponseEntity<List> response =
                restTemplate.exchange(
                        repositoriesUrl,
                        HttpMethod.GET,
                        request,
                        List.class
                );

        List<Map<String, Object>> repositories =
                response.getBody();

        List<GitHubRepositoryResponse> result =
                new ArrayList<>();

        for (Map<String, Object> repository : repositories) {

            Map<String, Object> owner =
                    (Map<String, Object>) repository.get("owner");

            String ownerUsername =
                    (String) owner.get("login");

            if (!ownerUsername.equals(githubAccount.getGithubUsername())) {
                continue;
            }

            String name =
                    (String) repository.get("name");

            Boolean privateValue =
                    (Boolean) repository.get("private");

            String htmlUrl =
                    (String) repository.get("html_url");

            result.add(
                    new GitHubRepositoryResponse(
                            name,
                            privateValue,
                            htmlUrl
                    )
            );
        }

        return result;
    }

    public List<GitHubContentResponse> getSelectedRepositoryContents(Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return List.of();
        }

        GitHubAccount githubAccount =
                gitHubAccountRepository.findByUser(user).orElse(null);

        if (githubAccount == null) {
            return List.of();
        }

        String repositoryName =
                githubAccount.getRepositoryName();

        if (repositoryName == null ||
                repositoryName.equals("Not selected")) {
            return List.of();
        }

        String githubUsername =
                githubAccount.getGithubUsername();

        String accessToken =
                githubAccount.getAccessToken();

        String repositoryUrl =
                "https://api.github.com/repos/"
                        + githubUsername
                        + "/"
                        + repositoryName
                        + "/contents";

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(accessToken);

        headers.setAccept(
                List.of(MediaType.APPLICATION_JSON)
        );

        HttpEntity<Void> request =
                new HttpEntity<>(headers);

        ResponseEntity<List> response =
                restTemplate.exchange(
                        repositoryUrl,
                        HttpMethod.GET,
                        request,
                        List.class
                );

        List<Map<String, Object>> contents =
                response.getBody();

        List<GitHubContentResponse> result =
                new ArrayList<>();

        for (Map<String, Object> content : contents) {

            String name =
                    (String) content.get("name");

            String path =
                    (String) content.get("path");

            String type =
                    (String) content.get("type");

            result.add(
                    new GitHubContentResponse(
                            name,
                            path,
                            type
                    )
            );
        }

        return result;
    }

    public DSAProgressResponse getDSAProgress(Long userId) {

        List<GitHubContentResponse> contents =
                getSelectedRepositoryContents(userId);

        int totalSolved = 0;

        for (GitHubContentResponse content : contents) {

            if (content.getType().equals("dir")
                    && content.getName().matches("^\\d{4}-.*")) {

                totalSolved++;
            }
        }

        return new DSAProgressResponse(totalSolved);
    }

    public List<DSAProblemResponse> getSolvedProblemsFromGitHub(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<GitHubContentResponse> contents =
                getSelectedRepositoryContents(userId);

        List<DSAProblemResponse> solvedProblems = new ArrayList<>();

        for (GitHubContentResponse content : contents) {

            if (content.getType().equals("dir")
                    && content.getName().matches("^\\d{4}-.*")) {

                String folderName = content.getName();

                String problemNumber = folderName.substring(0, 4);
                String problemName = folderName.substring(5);

                LeetCodeProblemResponse leetCodeProblem =
                        getLeetCodeProblem(problemNumber);

                List<String> topics = new ArrayList<>();

                if (leetCodeProblem != null
                        && leetCodeProblem.getTopicTags() != null) {

                    for (LeetCodeProblemResponse.TopicTag tag :
                            leetCodeProblem.getTopicTags()) {

                        topics.add(tag.getName());
                    }
                }

                // Find existing problem or create a new one
                Problem problem =
                        problemRepository
                                .findByProblemNumber(problemNumber)
                                .orElse(null);

                if (problem == null && leetCodeProblem != null) {

                    problem = new Problem(
                            problemNumber,
                            leetCodeProblem.getTitle(),
                            "LeetCode",
                            leetCodeProblem.getDifficulty(),
                            leetCodeProblem.getUrl()
                    );
                }

                // Save topics and connect them to the problem
                if (problem != null) {

                    problemRepository.save(problem);

                    if (user.getSolvedProblems() == null) {
                        user.setSolvedProblems(new java.util.HashSet<>());
                    }

                    user.getSolvedProblems().add(problem);

                    userRepository.save(user);

                    try {

                        java.util.Set<Topic> topicEntities =
                                new java.util.HashSet<>();

                        for (String topicName : topics) {

                            Topic topic =
                                    topicRepository
                                            .findByName(topicName)
                                            .orElseGet(() ->
                                                    topicRepository.save(
                                                            new Topic(topicName)
                                                    )
                                            );

                            topicEntities.add(topic);
                        }

                        problem.setTopics(topicEntities);

                        problemRepository.save(problem);

                    } catch (Exception e) {

                        e.printStackTrace();

                        throw e;
                    }
                }

                solvedProblems.add(
                        new DSAProblemResponse(
                                problemNumber,
                                problemName,
                                topics
                        )
                );
            }
        }

        return solvedProblems;
    }

    public List<SolvedProblemResponse> getSolvedProblemsFromDatabase(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Problem> problems =
                problemRepository.findByUsersContaining(user);

        List<SolvedProblemResponse> result =
                new ArrayList<>();

        for (Problem problem : problems) {

            List<String> topics =
                    new ArrayList<>();

            if (problem.getTopics() != null) {

                for (Topic topic : problem.getTopics()) {
                    topics.add(topic.getName());
                }
            }

            result.add(
                    new SolvedProblemResponse(
                            problem.getProblemNumber(),
                            problem.getTitle(),
                            problem.getPlatform(),
                            problem.getDifficulty(),
                            problem.getProblemUrl(),
                            topics
                    )
            );
        }

        return result;
    }


    public List<TopicProgressResponse> getTopicProgressFromGitHub(
            Long userId) {

        List<DSAProblemResponse> solvedProblems =
                getSolvedProblemsFromGitHub(userId);

        Map<String, Integer> topicCounts =
                new java.util.HashMap<>();

        for (DSAProblemResponse problem : solvedProblems) {

            for (String topic : problem.getTopics()) {

                topicCounts.put(
                        topic,
                        topicCounts.getOrDefault(topic, 0) + 1
                );
            }
        }

        List<TopicProgressResponse> result =
                new ArrayList<>();

        for (Map.Entry<String, Integer> entry :
                topicCounts.entrySet()) {

            result.add(
                    new TopicProgressResponse(
                            entry.getKey(),
                            entry.getValue()
                    )
            );
        }

        return result;
    }

    public List<DifficultyProgressResponse> getDifficultyProgressFromGitHub(
            Long userId) {

        List<GitHubContentResponse> contents =
                getSelectedRepositoryContents(userId);

        Map<String, Integer> difficultyCounts =
                new java.util.HashMap<>();

        for (GitHubContentResponse content : contents) {

            if (content.getType().equals("dir")
                    && content.getName().matches("^\\d{4}-.*")) {

                String problemNumber =
                        content.getName().substring(0, 4);

                LeetCodeProblemResponse problem =
                        getLeetCodeProblem(problemNumber);

                if (problem != null
                        && problem.getDifficulty() != null) {

                    String difficulty = problem.getDifficulty();

                    difficultyCounts.put(
                            difficulty,
                            difficultyCounts.getOrDefault(difficulty, 0) + 1
                    );
                }
            }
        }

        List<DifficultyProgressResponse> result =
                new ArrayList<>();

        for (Map.Entry<String, Integer> entry :
                difficultyCounts.entrySet()) {

            result.add(
                    new DifficultyProgressResponse(
                            entry.getKey(),
                            entry.getValue()
                    )
            );
        }

        return result;
    }
    public LeetCodeProblemResponse getLeetCodeProblem(
            String problemNumber) {

        RestTemplate restTemplate = new RestTemplate();

        String url =
                "https://leetcode-api-pied.vercel.app/problem/"
                        + Integer.parseInt(problemNumber);

        return restTemplate.getForObject(
                url,
                LeetCodeProblemResponse.class
        );
    }

    public List<DifficultyProgressResponse> getDifficultyProgressFromDatabase(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Object[]> results =
                problemRepository.countProblemsByDifficulty(user);

        List<DifficultyProgressResponse> response =
                new ArrayList<>();

        for (Object[] row : results) {

            String difficulty = (String) row[0];
            int count = ((Long) row[1]).intValue();

            response.add(
                    new DifficultyProgressResponse(
                            difficulty,
                            count
                    )
            );
        }

        return response;
    }

    public List<TopicProgressResponse> getTopicProgressFromDatabase(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Object[]> results =
                problemRepository.countProblemsByTopic(user);

        List<TopicProgressResponse> response =
                new ArrayList<>();

        for (Object[] row : results) {

            String topic = (String) row[0];
            int count = ((Long) row[1]).intValue();

            response.add(
                    new TopicProgressResponse(
                            topic,
                            count
                    )
            );
        }

        return response;
    }

    public DSAProgressResponse getDSAProgressFromDatabase(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        long totalSolved =
                problemRepository.countSolvedProblemsByUser(user);

        return new DSAProgressResponse((int) totalSolved);
    }

    public void saveProgressHistory(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        long totalSolved =
                problemRepository.countSolvedProblemsByUser(user);

        java.time.LocalDate today =
                java.time.LocalDate.now();

        ProgressHistory history =
                progressHistoryRepository
                        .findByUserIdAndDate(userId, today)
                        .orElse(null);

        if (history == null) {

            history = new ProgressHistory(
                    userId,
                    today,
                    (int) totalSolved
            );

        } else {

            history.setTotalSolved((int) totalSolved);
        }

        progressHistoryRepository.save(history);
    }

    public List<ProgressHistory> getProgressHistory(Long userId) {

        return progressHistoryRepository
                .findByUserIdOrderByDateAsc(userId);
    }

    public DashboardResponse getDashboard(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        long totalSolved =
                problemRepository.countSolvedProblemsByUser(user);

        List<Object[]> difficultyResults =
                problemRepository.countProblemsByDifficulty(user);

        int easy = 0;
        int medium = 0;
        int hard = 0;

        for (Object[] row : difficultyResults) {

            String difficulty = (String) row[0];
            int count = ((Long) row[1]).intValue();

            if (difficulty.equalsIgnoreCase("Easy")) {
                easy = count;
            } else if (difficulty.equalsIgnoreCase("Medium")) {
                medium = count;
            } else if (difficulty.equalsIgnoreCase("Hard")) {
                hard = count;
            }
        }

        return new DashboardResponse(
                (int) totalSolved,
                easy,
                medium,
                hard
        );
    }

    public String buildAIAnalysisData(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        long totalSolved =
                problemRepository.countSolvedProblemsByUser(user);

        List<Object[]> difficultyResults =
                problemRepository.countProblemsByDifficulty(user);

        List<Object[]> topicResults =
                problemRepository.countProblemsByTopic(user);

        StringBuilder data = new StringBuilder();

        data.append("DSA Progress Analysis\n");
        data.append("Total Solved: ")
                .append(totalSolved)
                .append("\n\n");

        data.append("Difficulty:\n");

        for (Object[] row : difficultyResults) {

            data.append(row[0])
                    .append(": ")
                    .append(row[1])
                    .append("\n");
        }

        data.append("\nTopics:\n");

        for (Object[] row : topicResults) {

            data.append(row[0])
                    .append(": ")
                    .append(row[1])
                    .append("\n");
        }

        return data.toString();
    }
    public GitHubAccount save(GitHubAccount account) {
        return gitHubAccountRepository.save(account);
    }



}