package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserProblem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserProblemRepository
        extends JpaRepository<UserProblem, Long> {

    List<UserProblem> findByUser(User user);
}