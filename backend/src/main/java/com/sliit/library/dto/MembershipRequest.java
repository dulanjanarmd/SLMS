package com.sliit.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MembershipRequest {

    @NotBlank
    private String title;

    @NotBlank
    @Size(max = 150)
    private String nameWithInitials;

    @NotBlank
    @Size(max = 300)
    private String address;

    @NotBlank
    @Size(max = 20)
    private String contactNumber;

    @Size(max = 20)
    private String whatsappNumber;

    @NotBlank
    @Size(max = 150)
    private String memberEmail;

    @NotBlank
    private String memberType;

    @NotBlank
    @Size(max = 100)
    private String faculty;

    @NotBlank
    @Size(max = 100)
    private String programme;

    @NotBlank
    @Size(max = 50)
    private String academicYear;

    @Size(max = 500)
    private String reason;
}
