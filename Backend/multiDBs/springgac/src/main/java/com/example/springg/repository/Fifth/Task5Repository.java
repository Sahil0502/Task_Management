package com.example.springg.repository.Fifth;

import com.example.springg.model.Fifth.Task5;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task5Repository extends JpaRepository<Task5, Long> {
    Page<Task5> findAll(Pageable pageable);
}
