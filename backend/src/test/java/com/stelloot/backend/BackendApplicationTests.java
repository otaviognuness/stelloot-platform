package com.stelloot.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stelloot.backend.repository.FavoriteRepository;
import com.stelloot.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @BeforeEach
    void cleanDatabase() {
        favoriteRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void contextLoads() {
    }

    @Test
    void registerReturnsJwtAndAuthenticatedUser() throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "Otavio",
                                  "email": "otavio@stelloot.com",
                                  "password": "12345678"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("otavio@stelloot.com"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode body = objectMapper.readTree(response);
        String token = body.get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("Otavio"))
                .andExpect(jsonPath("$.email").value("otavio@stelloot.com"));
    }

    @Test
    void loginRejectsWrongPassword() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "Teste",
                                  "email": "teste@stelloot.com",
                                  "password": "12345678"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "teste@stelloot.com",
                                  "password": "senhaerrada"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email ou senha invalidos"));
    }

    @Test
    void wishlistRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/wishlist"))
                .andExpect(status().isForbidden());
    }

    @Test
    void authenticatedUserCanManageWishlistAndTargetPrice() throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "Mobile",
                                  "email": "mobile@stelloot.com",
                                  "password": "12345678"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String token = objectMapper.readTree(response).get("token").asText();

        String savedItem = mockMvc.perform(post("/api/wishlist")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "externalGameId": "steam-1091500",
                                  "dealId": "deal-cyberpunk",
                                  "storeId": "1",
                                  "steamAppId": "1091500",
                                  "title": "Cyberpunk 2077",
                                  "thumb": "https://example.com/cyberpunk.jpg",
                                  "salePrice": 19.99,
                                  "normalPrice": 59.99,
                                  "savings": 66,
                                  "targetPrice": 80
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Cyberpunk 2077"))
                .andExpect(jsonPath("$.targetPrice").value(80))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long favoriteId = objectMapper.readTree(savedItem).get("id").asLong();

        mockMvc.perform(get("/api/wishlist")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].externalGameId").value("steam-1091500"));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/wishlist/" + favoriteId + "/target-price")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "targetPrice": 65
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetPrice").value(65));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/api/wishlist/" + favoriteId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/wishlist")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }
}
