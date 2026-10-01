package com.vinayaka.dsa.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/github")
    public String github() {
        return "github";
    }

    @GetMapping("/problems-page")
    public String problems() {
        return "problems";
    }

    @GetMapping("/analytics")
    public String analytics() {
        return "analytics";
    }

    @GetMapping("/progress")
    public String progress() {
        return "progress";
    }

    @GetMapping("/settings")
    public String settingsPage() {
        return "settings";
    }
}