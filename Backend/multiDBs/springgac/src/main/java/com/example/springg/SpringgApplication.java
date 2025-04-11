package com.example.springg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.springg")
@EntityScan(basePackages = {"com.example.springg.model.primary", "com.example.springg.model.secondary", "com.example.springg.model.Third",
        "com.example.springg.model.Fourth", "com.example.springg.model.Fifth", "com.example.springg.model.Six",
        "com.example.springg.model.Seven", "com.example.springg.model.Eight", "com.example.springg.model.Nine",
        "com.example.springg.model.Ten"})
public class SpringgApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringgApplication.class, args);
    }
}









//package com.example.springg;
//
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.autoconfigure.domain.EntityScan;
//import org.springframework.cache.annotation.EnableCaching;
//import org.springframework.context.annotation.ComponentScan;
//
//@SpringBootApplication
//@EnableCaching
//@ComponentScan(basePackages = "com.example.springg")
//@EntityScan(basePackages = {"com.example.springg.model.primary", "com.example.springg.model.secondary", "com.example.springg.model.Third", "com.example.springg.model.Fourth", "com.example.springg.model.Fifth", "com.example.springg.model.Six", "com.example.springg.model.Seven", "com.example.springg.model.Eight", "com.example.springg.model.Nine", "com.example.springg.model.Ten"})
//public class SpringgApplication {
//    public static void main(String[] args) {
//        SpringApplication.run(SpringgApplication.class, args);
//    }
//}
