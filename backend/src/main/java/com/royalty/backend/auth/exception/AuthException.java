package com.royalty.backend.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED) // ⭐ 이 줄 추가
public class AuthException extends RuntimeException {

    public AuthException(String message) {
        super(message);
    }
}
