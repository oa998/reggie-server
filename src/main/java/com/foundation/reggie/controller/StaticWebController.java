package com.foundation.reggie.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StaticWebController {

    /**
     * Serves index.html for the root path.
     */
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
}
