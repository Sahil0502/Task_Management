package com.example.springg.repository.Fourth;

import com.example.springg.model.Fourth.Task4;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task4Repository extends JpaRepository<Task4, Long> {
    Page<Task4> findAll(Pageable pageable);
}
