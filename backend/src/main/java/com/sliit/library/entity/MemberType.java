package com.sliit.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String name;
}
