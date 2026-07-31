package com.sliit.library.service;

import com.sliit.library.entity.ContactInfo;
import com.sliit.library.repository.ContactInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ContactInfoService {

    @Autowired
    private ContactInfoRepository contactInfoRepository;

    public List<ContactInfo> getAll() {
        return contactInfoRepository.findAll();
    }

    public List<ContactInfo> getActive() {
        return contactInfoRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public ContactInfo getById(Long id) {
        return contactInfoRepository.findById(id).orElse(null);
    }

    public ContactInfo create(ContactInfo contactInfo) {
        return contactInfoRepository.save(contactInfo);
    }

    public ContactInfo update(Long id, ContactInfo contactInfo) {
        ContactInfo existing = contactInfoRepository.findById(id).orElse(null);
        if (existing == null) return null;
        
        existing.setType(contactInfo.getType());
        existing.setLabel(contactInfo.getLabel());
        existing.setValue(contactInfo.getValue());
        existing.setDescription(contactInfo.getDescription());
        existing.setIsActive(contactInfo.getIsActive());
        existing.setDisplayOrder(contactInfo.getDisplayOrder());
        
        return contactInfoRepository.save(existing);
    }

    public void delete(Long id) {
        contactInfoRepository.deleteById(id);
    }
}
