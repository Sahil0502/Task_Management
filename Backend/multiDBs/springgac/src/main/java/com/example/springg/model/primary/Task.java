package com.example.springg.model.primary;

import jakarta.persistence.*;
import java.util.Date;

//@Entity
//@Table(name = "task", schema = "sys") // Specify schema
//public class Task {

//package com.example.springg.model;

//import jakarta.persistence.*;
//import java.util.Date;

    @Entity
    @Table(name = "task")
    public class Task {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "jid", length = 50)
        private String jid;

        @Column(name = "duedate")
        @Temporal(TemporalType.TIMESTAMP)
        private Date dueDate;

        @Column(name = "articleid", length = 50)
        private String articleId;

        @Column(name = "receiveddate")
        @Temporal(TemporalType.TIMESTAMP)
        private Date receivedDate;

        @Column(name = "journalcomplexity", length = 50)
        private String journalComplexity;

        @Column(name = "department", length = 100)
        private String department;

        @Column(name = "taskid")
        private Long taskId;

        @Column(name = "taskname", length = 255)
        private String taskName;

        @Column(name = "user", length = 100)
        private String user;

        @Transient
        private String customer;

        public Task() {}

        public Task(Long id, String jid, Date dueDate, String articleId, Date receivedDate, String journalComplexity, String department, Long taskId, String taskName, String user) {
            this.id = id;
            this.jid = jid;
            this.dueDate = dueDate;
            this.articleId = articleId;
            this.receivedDate = receivedDate;
            this.journalComplexity = journalComplexity;
            this.department = department;
            this.taskId = taskId;
            this.taskName = taskName;
            this.user = user;
        }

        // Getters and Setters

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getJid() { return jid; }
        public void setJid(String jid) { this.jid = jid; }

        public Date getDueDate() { return dueDate; }
        public void setDueDate(Date dueDate) { this.dueDate = dueDate; }

        public String getArticleId() { return articleId; }
        public void setArticleId(String articleId) { this.articleId = articleId; }

        public Date getReceivedDate() { return receivedDate; }
        public void setReceivedDate(Date receivedDate) { this.receivedDate = receivedDate; }

        public String getJournalComplexity() { return journalComplexity; }
        public void setJournalComplexity(String journalComplexity) { this.journalComplexity = journalComplexity; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public String getTaskName() { return taskName; }
        public void setTaskName(String taskName) { this.taskName = taskName; }

        public String getUser() { return user; }
        public void setUser(String user) { this.user = user; }

        public String getCustomer(){ return customer; }
        public void setCustomer(String customer){ this.customer = customer; }
    }