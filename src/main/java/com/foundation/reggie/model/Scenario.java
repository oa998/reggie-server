package com.foundation.reggie.model;

import lombok.Data;

import java.util.List;

@Data
public class Scenario {
    private String id;
    private String name;
    private String description;
    private List<ScenarioMessage> messages;
}
