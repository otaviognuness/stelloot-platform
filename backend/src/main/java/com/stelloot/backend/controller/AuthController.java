package com.stelloot.backend.controller;

import com.stelloot.backend.dto.AuthResponseDTO;
import com.stelloot.backend.dto.LoginRequestDTO;
import com.stelloot.backend.dto.UserRequestDTO;
import com.stelloot.backend.dto.UserResponseDTO;
import com.stelloot.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponseDTO register(@RequestBody @Valid UserRequestDTO request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody @Valid LoginRequestDTO request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponseDTO me(Authentication authentication) {
        return authService.getCurrentUser(authentication.getName());
    }
}
