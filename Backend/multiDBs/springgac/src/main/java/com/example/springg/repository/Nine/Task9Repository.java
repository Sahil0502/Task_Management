package com.example.springg.repository.Nine;

import com.example.springg.model.Nine.Task9;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task9Repository extends JpaRepository<Task9, Long> {
    Page<Task9> findAll(Pageable pageable);
}
