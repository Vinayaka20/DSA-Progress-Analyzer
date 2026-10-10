package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.Problem;
import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserProblem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProblemRepository
        extends JpaRepository<UserProblem, Long> {

    // Existing method used by UserProblemService
    List<UserProblem> findByUser(User user);

    // Used to check whether a user already has a problem
    boolean existsByUserAndProblem(
            User user,
            Problem problem
    );

    // Used by GitHub Sync to find and update an existing record
    Optional<UserProblem> findByUserAndProblem(
            User user,
            Problem problem
    );
}