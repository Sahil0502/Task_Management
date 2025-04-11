# Task_Management

# 🚀 Multi-Database Task Management System (Spring Boot + GraphQL + React)

A high-performance, real-time **Task Management System** designed to scale across **10 MySQL databases**, supporting **lakhs of tasks** with optimized querying, Redis caching, and a responsive frontend using **React + Apollo Client + MUI DataGrid**.

---

## 📌 Features

### ✅ Backend (Spring Boot + GraphQL)
- 🔗 Connects to **10 separate MySQL databases**, each with unique task entities (`Task` to `Task10`).
- ⚡ Handles **lakhs of records efficiently** using pagination, lazy loading, and batch fetching.
- 🧩 **GraphQL** support with optimized resolvers for querying and subscriptions.
- 🧮 `getTotalTasksCount` endpoint to aggregate task counts across all sources.
- 🧠 **Redis caching with TTL** to reduce DB load and improve response times.
- 🔁 Real-time updates via **GraphQL subscriptions**.

### ✅ Frontend (React + Apollo Client + MUI)
- ⚛️ Built using **React** + **Apollo Client** for seamless GraphQL integration.
- 📋 Uses **Material-UI DataGrid** with support for:
  - Server-side pagination
  - Sorting & Filtering
  - Auto-refresh for real-time experience
- 🔄 Fetches and merges paginated task data from multiple sources for a unified view.

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Spring Boot, GraphQL, Redis         |
| Database  | MySQL (10 separate databases)       |
| Frontend  | React, Apollo Client, MUI DataGrid  |
| Caching   | Redis with TTL                      |

---


