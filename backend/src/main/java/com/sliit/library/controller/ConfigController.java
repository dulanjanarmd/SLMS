package com.sliit.library.controller;

import com.sliit.library.entity.Faculty;
import com.sliit.library.entity.MemberType;
import com.sliit.library.repository.FacultyRepository;
import com.sliit.library.repository.MemberTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private MemberTypeRepository memberTypeRepository;

    @GetMapping("/faculties")
    public ResponseEntity<List<Faculty>> getFaculties() {
        return ResponseEntity.ok(facultyRepository.findAll());
    }

    @GetMapping("/member-types")
    public ResponseEntity<List<MemberType>> getMemberTypes() {
        return ResponseEntity.ok(memberTypeRepository.findAll());
    }
}
