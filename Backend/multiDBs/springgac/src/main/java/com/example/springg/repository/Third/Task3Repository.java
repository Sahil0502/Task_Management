package com.example.springg.repository.Third;

import com.example.springg.model.Third.Task3;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Task3Repository extends JpaRepository<Task3, Long> {
    Page<Task3> findAll(Pageable pageable);
}
