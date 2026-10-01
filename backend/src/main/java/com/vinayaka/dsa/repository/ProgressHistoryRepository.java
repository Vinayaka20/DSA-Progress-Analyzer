package com.vinayaka.dsa.repository;

import com.vinayaka.dsa.entity.ProgressHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProgressHistoryRepository
        extends JpaRepository<ProgressHistory, Long> {

    Optional<ProgressHistory> findByUserIdAndDate(
            Long userId,
            LocalDate date
    );

    List<ProgressHistory> findByUserIdOrderByDateAsc(
            Long userId
    );
}