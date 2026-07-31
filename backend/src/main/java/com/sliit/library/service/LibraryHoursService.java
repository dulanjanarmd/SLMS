package com.sliit.library.service;

import com.sliit.library.entity.LibraryHours;
import com.sliit.library.repository.LibraryHoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class LibraryHoursService {

    @Autowired
    private LibraryHoursRepository libraryHoursRepository;

    public List<LibraryHours> getAll() {
        return libraryHoursRepository.findAll();
    }

    public LibraryHours getById(Long id) {
        return libraryHoursRepository.findById(id).orElse(null);
    }

    public LibraryHours getByDayOfWeek(String dayOfWeek) {
        return libraryHoursRepository.findByDayOfWeek(dayOfWeek).orElse(null);
    }

    public LibraryHours create(LibraryHours libraryHours) {
        return libraryHoursRepository.save(libraryHours);
    }

    public LibraryHours update(Long id, LibraryHours libraryHours) {
        LibraryHours existing = libraryHoursRepository.findById(id).orElse(null);
        if (existing == null) return null;
        
        existing.setDayOfWeek(libraryHours.getDayOfWeek());
        existing.setOpenTime(libraryHours.getOpenTime());
        existing.setCloseTime(libraryHours.getCloseTime());
        existing.setIsOpen(libraryHours.getIsOpen());
        existing.setNotes(libraryHours.getNotes());
        
        return libraryHoursRepository.save(existing);
    }

    public void delete(Long id) {
        libraryHoursRepository.deleteById(id);
    }
}
