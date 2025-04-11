package com.example.springg.config;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.example.springg.repository.Fifth",
        entityManagerFactoryRef = "FifthEntityManagerFactory",
        transactionManagerRef = "FifthTransactionManager"
)
public class FifthDatabaseConfig {

    @Bean(name = "FifthDataSource")
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();

        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/sys5");
        dataSource.setUsername("root");
        dataSource.setPassword("root123");
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        return dataSource;
    }

    @Bean(name = "FifthEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("FifthDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.example.springg.model.Fifth")
                .persistenceUnit("Fifth")
                .build();
    }

    @Bean(name = "FifthTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("FifthEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}


