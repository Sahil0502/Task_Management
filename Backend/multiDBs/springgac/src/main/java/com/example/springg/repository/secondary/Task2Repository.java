package com.example.springg.repository.secondary;

import com.example.springg.model.secondary.Task2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task2Repository extends JpaRepository<Task2, Long> {
    Page<Task2> findAll(Pageable pageable);
}
