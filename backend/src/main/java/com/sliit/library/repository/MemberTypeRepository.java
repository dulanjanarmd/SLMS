package com.sliit.library.repository;

import com.sliit.library.entity.MemberType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberTypeRepository extends JpaRepository<MemberType, Long> {
    boolean existsByName(String name);
}
