package com.vinayaka.dsa.controller;

import com.vinayaka.dsa.GitHubRepositoryResponse;
import com.vinayaka.dsa.entity.GitHubAccount;
import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.repository.GitHubAccountRepository;
import com.vinayaka.dsa.repository.UserRepository;
import com.vinayaka.dsa.service.GitHubAccountService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class GitHubAuthController {

    private final UserRepository userRepository;
    private final GitHubAccountRepository gitHubAccountRepository;
    private final GitHubAccountService gitHubAccountService;

    @Value("${github.client.secret}")
    private String clientSecret;

    @Value("${github.client.id}")
    private String clientId;

    public GitHubAuthController(
            UserRepository userRepository,
            GitHubAccountRepository gitHubAccountRepository,
            GitHubAccountService gitHubAccountService) {

        this.userRepository = userRepository;
        this.gitHubAccountRepository = gitHubAccountRepository;
        this.gitHubAccountService = gitHubAccountService;
    }

    // 1. Send user to GitHub authorization page
    @GetMapping("/github/login")
    public RedirectView githubLogin(@RequestParam Long userId) {

        String githubUrl = "https://github.com/login/oauth/authorize"
                + "?client_id=" + clientId
                + "&scope=read:user repo"
                + "&state=" + userId;

        return new RedirectView(githubUrl);
    }

    // 2. GitHub redirects back here after authorization
    @GetMapping("/github/callback")
    public String githubCallback(
            @RequestParam String code,
            @RequestParam String state) {

        RestTemplate restTemplate = new RestTemplate();

        Long userId = Long.parseLong(state);

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return "User not found";
        }

        // Exchange authorization code for access token
        String tokenUrl =
                "https://github.com/login/oauth/access_token";

        HttpHeaders tokenHeaders = new HttpHeaders();

        tokenHeaders.setContentType(
                MediaType.APPLICATION_JSON
        );

        tokenHeaders.setAccept(
                List.of(MediaType.APPLICATION_JSON)
        );

        Map<String, String> requestBody = Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "code", code
        );

        HttpEntity<Map<String, String>> tokenRequest =
                new HttpEntity<>(requestBody, tokenHeaders);

        ResponseEntity<Map> tokenResponse =
                restTemplate.postForEntity(
                        tokenUrl,
                        tokenRequest,
                        Map.class
                );

        String accessToken =
                (String) tokenResponse.getBody()
                        .get("access_token");

        // Get GitHub user information
        String userUrl =
                "https://api.github.com/user";

        HttpHeaders userHeaders = new HttpHeaders();

        userHeaders.setBearerAuth(accessToken);

        userHeaders.setAccept(
                List.of(MediaType.APPLICATION_JSON)
        );

        HttpEntity<Void> userRequest =
                new HttpEntity<>(userHeaders);

        ResponseEntity<Map> githubUserResponse =
                restTemplate.exchange(
                        userUrl,
                        HttpMethod.GET,
                        userRequest,
                        Map.class
                );

        Map githubUser =
                githubUserResponse.getBody();

        String githubUsername =
                (String) githubUser.get("login");

        // Find existing GitHub account
        GitHubAccount githubAccount =
                gitHubAccountRepository
                        .findByUser(user)
                        .orElse(null);

        // Create new account if it doesn't exist
        if (githubAccount == null) {

            githubAccount = new GitHubAccount(
                    githubUsername,
                    "Not selected",
                    accessToken,
                    user
            );

        } else {

            // Update existing account
            githubAccount.setGithubUsername(
                    githubUsername
            );

            githubAccount.setAccessToken(
                    accessToken
            );
        }

        gitHubAccountRepository.save(githubAccount);

        return "GitHub connected successfully";
    }

    // 3. Get repositories using the saved access token
    @GetMapping("/github/repositories")
    public List<GitHubRepositoryResponse> getRepositories(
            @RequestParam Long userId) {

        User user =
                userRepository.findById(userId).orElse(null);

        if (user == null) {
            return List.of();
        }

        GitHubAccount githubAccount =
                gitHubAccountService
                        .getGitHubAccountByUser(user);

        if (githubAccount == null) {
            return List.of();
        }

        String accessToken =
                githubAccount.getAccessToken();

        RestTemplate restTemplate =
                new RestTemplate();

        String repositoriesUrl =
                "https://api.github.com/user/repos";

        HttpHeaders headers =
                new HttpHeaders();

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
}