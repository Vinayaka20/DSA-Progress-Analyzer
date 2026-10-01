package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.User;
import com.vinayaka.dsa.entity.UserGoals;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserGoalsRepository extends JpaRepository<UserGoals, Long> {

    Optional<UserGoals> findByUser(User user);

}