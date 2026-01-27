package com.royalty.backend.auth.domain;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private Long id;              // user_id
    private String username;      // username
    private String password;      // password
    private String email;         // email
    private Role role;            // role

    // OAuth
    private String provider;      // LOCAL / KAKAO
    private String providerId;    // provider_id

    private LocalDateTime createdAt; // created_at
}
