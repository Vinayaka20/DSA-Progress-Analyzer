package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.Problem;
import com.vinayaka.dsa.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Optional<Problem> findByProblemNumber(String problemNumber);

    List<Problem> findByUsersContaining(User user);

    @Query("""
        SELECT p.difficulty, COUNT(p)
        FROM Problem p
        JOIN p.users u
        WHERE u = :user
        GROUP BY p.difficulty
    """)
    List<Object[]> countProblemsByDifficulty(@Param("user") User user);

    @Query("""
    SELECT t.name, COUNT(p)
    FROM Problem p
    JOIN p.users u
    JOIN p.topics t
    WHERE u = :user
    GROUP BY t.name
""")
    List<Object[]> countProblemsByTopic(@Param("user") User user);

    @Query("""
    SELECT COUNT(p)
    FROM Problem p
    JOIN p.users u
    WHERE u = :user
""")
    long countSolvedProblemsByUser(@Param("user") User user);
}