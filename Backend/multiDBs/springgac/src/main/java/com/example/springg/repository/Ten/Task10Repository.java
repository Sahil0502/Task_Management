package com.example.springg.repository.Ten;

import com.example.springg.model.Ten.Task10;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task10Repository extends JpaRepository<Task10, Long> {
    Page<Task10> findAll(Pageable pageable);
}
