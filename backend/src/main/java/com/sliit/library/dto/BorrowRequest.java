package com.sliit.library.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BorrowRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long bookId;

    private Long issuedById;

    private Long reservationId; // optional: fulfill a specific reservation when issuing
}
