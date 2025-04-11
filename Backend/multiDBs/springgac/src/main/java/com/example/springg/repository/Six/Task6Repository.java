package com.example.springg.repository.Six;

import com.example.springg.model.Six.Task6;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task6Repository extends JpaRepository<Task6, Long> {
    Page<Task6> findAll(Pageable pageable);
}
