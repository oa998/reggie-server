package com.foundation.reggie.message;

import lombok.Data;

@Data
public class OrderCreated {
    private String orderId;
    private String customerId;
    private Double amount;
}
