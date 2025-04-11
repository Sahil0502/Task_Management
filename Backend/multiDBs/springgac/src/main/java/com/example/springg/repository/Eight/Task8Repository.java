package com.example.springg.repository.Eight;

import com.example.springg.model.Eight.Task8;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task8Repository extends JpaRepository<Task8, Long> {
    Page<Task8> findAll(Pageable pageable);
}
