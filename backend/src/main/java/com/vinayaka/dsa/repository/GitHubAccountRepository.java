package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.GitHubAccount;
import com.vinayaka.dsa.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GitHubAccountRepository
        extends JpaRepository<GitHubAccount, Long> {

    List<GitHubAccount> findAllByUser(User user);

    Optional<GitHubAccount> findByUser(User user);
}