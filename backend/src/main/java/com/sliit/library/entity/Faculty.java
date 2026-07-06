package com.sliit.library.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 150)
    private String name;

    @Column(length = 20)
    private String code;
}
