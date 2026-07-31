package com.sliit.library.controller;

import com.sliit.library.entity.ContactInfo;
import com.sliit.library.service.ContactInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ContactInfoController {

    @Autowired
    private ContactInfoService contactInfoService;

    @GetMapping("/contact-info")
    public ResponseEntity<List<ContactInfo>> getAllContactInfo() {
        return ResponseEntity.ok(contactInfoService.getAll());
    }

    @GetMapping("/contact-info/active")
    public ResponseEntity<List<ContactInfo>> getActiveContactInfo() {
        return ResponseEntity.ok(contactInfoService.getActive());
    }

    @GetMapping("/contact-info/{id}")
    public ResponseEntity<ContactInfo> getContactInfoById(@PathVariable Long id) {
        ContactInfo contact = contactInfoService.getById(id);
        if (contact == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(contact);
    }

    @PostMapping("/librarian/contact-info")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<ContactInfo> createContactInfo(@RequestBody ContactInfo contactInfo) {
        return ResponseEntity.ok(contactInfoService.create(contactInfo));
    }

    @PutMapping("/librarian/contact-info/{id}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<ContactInfo> updateContactInfo(@PathVariable Long id, @RequestBody ContactInfo contactInfo) {
        ContactInfo updated = contactInfoService.update(id, contactInfo);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/librarian/contact-info/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> deleteContactInfo(@PathVariable Long id) {
        contactInfoService.delete(id);
        return ResponseEntity.ok().build();
    }
}
