package com.bugxyz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BugXyzApplication {
    public static void main(String[] args) {
        SpringApplication.run(BugXyzApplication.class, args);
    }
}
