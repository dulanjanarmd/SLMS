package com.sliit.library.repository;

import com.sliit.library.entity.ContactInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactInfoRepository extends JpaRepository<ContactInfo, Long> {
    List<ContactInfo> findAllByIsActiveTrueOrderByDisplayOrderAsc();
    List<ContactInfo> findAllByOrderByDisplayOrderAsc();
}
