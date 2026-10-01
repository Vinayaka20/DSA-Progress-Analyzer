package com.vinayaka.dsa.controller;
import java.util.List;

import com.vinayaka.dsa.service.UserService;
import org.springframework.web.bind.annotation.RestController;
import com.vinayaka.dsa.entity.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.vinayaka.dsa.SettingsResponse;
import com.vinayaka.dsa.SettingsRequest;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }



    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/users/{userId}/settings")
    public SettingsResponse getSettings(@PathVariable Long userId) {
        return userService.getSettings(userId);
    }

    @PutMapping("/users/{userId}/settings")
    public SettingsResponse updateSettings(
            @PathVariable Long userId,
            @RequestBody SettingsRequest request) {

        return userService.updateSettings(userId, request);
    }
}
