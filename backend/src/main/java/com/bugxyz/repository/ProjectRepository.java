package com.bugxyz.repository;

import com.bugxyz.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Project> findByIsArchivedFalse(Pageable pageable);

    Page<Project> findByNameContainingIgnoreCaseAndIsArchivedFalse(String name, Pageable pageable);

    boolean existsByKey(String key);
}
