package com.sliit.library.service;

import com.sliit.library.dto.EventResponse;
import com.sliit.library.entity.Event;
import com.sliit.library.entity.User;
import com.sliit.library.repository.EventRepository;
import com.sliit.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    private EventResponse toResponse(Event e) {
        return EventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventDate(e.getEventDate())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .location(e.getLocation())
                .category(e.getCategory())
                .color(e.getColor())
                .createdByName(e.getCreatedBy() != null ? e.getCreatedBy().getFullName() : null)
                .isActive(e.getIsActive())
                .isPublic(e.getIsPublic())
                .banner(e.getBanner())
                .maxAttendees(e.getMaxAttendees())
                .build();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAll() {
        return eventRepository.findAllByOrderByEventDateAscStartTimeAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllActive() {
        return eventRepository.findByIsActiveTrueOrderByEventDateAscStartTimeAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getPublicUpcoming() {
        return eventRepository.findPublicUpcoming(LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getUpcoming() {
        return eventRepository.findUpcoming(LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse getById(Long id) {
        return eventRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Transactional
    public EventResponse create(Event eventRequest, Long createdById) {
        Event event = Event.builder()
                .title(eventRequest.getTitle())
                .description(eventRequest.getDescription())
                .eventDate(eventRequest.getEventDate())
                .startTime(eventRequest.getStartTime())
                .endTime(eventRequest.getEndTime())
                .location(eventRequest.getLocation())
                .category(eventRequest.getCategory())
                .color(eventRequest.getColor())
                .isActive(eventRequest.getIsActive() != null ? eventRequest.getIsActive() : true)
                .isPublic(eventRequest.getIsPublic() != null ? eventRequest.getIsPublic() : true)
                .banner(eventRequest.getBanner())
                .maxAttendees(eventRequest.getMaxAttendees())
                .build();
        if (createdById != null) {
            User u = userRepository.findById(createdById).orElse(null);
            event.setCreatedBy(u);
        }
        return toResponse(eventRepository.save(event));
    }

    @Transactional
    public EventResponse update(Long id, Event eventRequest) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        if (eventRequest.getTitle() != null) e.setTitle(eventRequest.getTitle());
        if (eventRequest.getDescription() != null) e.setDescription(eventRequest.getDescription());
        if (eventRequest.getEventDate() != null) e.setEventDate(eventRequest.getEventDate());
        if (eventRequest.getStartTime() != null) e.setStartTime(eventRequest.getStartTime());
        if (eventRequest.getEndTime() != null) e.setEndTime(eventRequest.getEndTime());
        if (eventRequest.getLocation() != null) e.setLocation(eventRequest.getLocation());
        if (eventRequest.getCategory() != null) e.setCategory(eventRequest.getCategory());
        if (eventRequest.getColor() != null) e.setColor(eventRequest.getColor());
        if (eventRequest.getIsActive() != null) e.setIsActive(eventRequest.getIsActive());
        if (eventRequest.getIsPublic() != null) e.setIsPublic(eventRequest.getIsPublic());
        if (eventRequest.getBanner() != null) e.setBanner(eventRequest.getBanner());
        if (eventRequest.getMaxAttendees() != null) e.setMaxAttendees(eventRequest.getMaxAttendees());
        return toResponse(eventRepository.save(e));
    }

    @Transactional
    public void delete(Long id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        eventRepository.delete(e);
    }

    @Transactional
    public EventResponse toggleActive(Long id) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        e.setIsActive(!Boolean.TRUE.equals(e.getIsActive()));
        return toResponse(eventRepository.save(e));
    }
}
