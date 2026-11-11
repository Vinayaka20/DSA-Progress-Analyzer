package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.Problem;
import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserProblem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProblemRepository
        extends JpaRepository<UserProblem, Long> {

    List<UserProblem> findByUser(User user);

    boolean existsByUserAndProblem(User user, Problem problem);

    Optional<UserProblem> findByUserAndProblem(User user, Problem problem);
}