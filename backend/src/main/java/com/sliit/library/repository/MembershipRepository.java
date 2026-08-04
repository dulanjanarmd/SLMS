package com.sliit.library.repository;

import com.sliit.library.entity.Membership;
import com.sliit.library.entity.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    Optional<Membership> findByUserId(Long userId);

    List<Membership> findByStatus(MembershipStatus status);

    long countByStatus(MembershipStatus status);

    boolean existsByUserIdAndStatus(Long userId, MembershipStatus status);
}
