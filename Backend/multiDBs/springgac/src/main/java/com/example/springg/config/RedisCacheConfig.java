package com.example.springg.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(60))  // Set TTL to 60 seconds to match frontend cache
                .disableCachingNullValues()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}









//package com.example.springg.config;
//
//import org.springframework.cache.CacheManager;
//import org.springframework.cache.annotation.EnableCaching;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.cache.RedisCacheConfiguration;
//import org.springframework.data.redis.cache.RedisCacheManager;
//import org.springframework.data.redis.connection.RedisConnectionFactory;
//import org.springframework.data.redis.serializer.RedisSerializationContext;
//import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
//import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
//import org.springframework.data.redis.serializer.StringRedisSerializer;
//
//import java.time.Duration;
//import java.util.HashMap;
//import java.util.Map;
//
//@Configuration
//@EnableCaching
//public class RedisCacheConfig {
//
//    @Bean
//    public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
//
//        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
//                .serializeKeysWith(SerializationPair.fromSerializer(new StringRedisSerializer()))
//                .serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
//                .entryTtl(Duration.ofMinutes(1)); // Default TTL 1 min
//
//        // You can add TTLs per cache name (like task2, task3...)
//        Map<String, RedisCacheConfiguration> configMap = new HashMap<>();
//        configMap.put("task2", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task3", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task4", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task5", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task6", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task7", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task8", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task9", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("task10", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//        configMap.put("tasks", defaultConfig.entryTtl(Duration.ofMinutes(1)));
//
//        return RedisCacheManager.builder(redisConnectionFactory)
//                .cacheDefaults(defaultConfig)
//                .withInitialCacheConfigurations(configMap)
//                .build();
//    }
//}
//
//
//
