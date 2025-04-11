package com.example.springg.repository.Seven;

import com.example.springg.model.Seven.Task7;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task7Repository extends JpaRepository<Task7, Long> {
    Page<Task7> findAll(Pageable pageable);
}
