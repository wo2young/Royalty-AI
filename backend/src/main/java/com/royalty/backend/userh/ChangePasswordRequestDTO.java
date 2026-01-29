package com.royalty.backend.userh;

import lombok.Getter;

@Getter
public class ChangePasswordRequestDTO {

    private String oldPassword;
    private String newPassword;
}