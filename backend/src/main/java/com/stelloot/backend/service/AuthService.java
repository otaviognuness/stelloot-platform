package com.stelloot.backend.service;

import com.stelloot.backend.dto.AuthResponseDTO;
import com.stelloot.backend.dto.LoginRequestDTO;
import com.stelloot.backend.dto.UserRequestDTO;
import com.stelloot.backend.dto.UserResponseDTO;
import com.stelloot.backend.model.User;
import com.stelloot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserService userService;

    public AuthResponseDTO register(UserRequestDTO request) {
        String email = request.getEmail().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("local")
                .build();

        return toAuthResponse(userRepository.save(user));
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos");
        }

        return toAuthResponse(user);
    }

    public UserResponseDTO getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado"));

        return userService.toResponseDTO(user);
    }

    private AuthResponseDTO toAuthResponse(User user) {
        return AuthResponseDTO.builder()
                .token(jwtService.generateToken(user))
                .tokenType("Bearer")
                .user(userService.toResponseDTO(user))
                .build();
    }
}
