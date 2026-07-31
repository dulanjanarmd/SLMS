package com.sliit.library.controller;

import com.sliit.library.service.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserStatsController {

    @Autowired
    private UserStatsService userStatsService;

    @GetMapping("/user/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getUserStats(Authentication auth) {
        Long userId = extractUserId(auth);
        return ResponseEntity.ok(userStatsService.getUserStats(userId));
    }

    private Long extractUserId(Authentication auth) {
        try {
            String userIdStr = auth.getName();
            return Long.parseLong(userIdStr);
        } catch (Exception e) {
            return null;
        }
    }
}
