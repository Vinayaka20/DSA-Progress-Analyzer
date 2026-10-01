package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}