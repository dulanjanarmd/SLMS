# Online Library Management System

This is a full-stack online library management system designed for SLIIT University. The system provides a comprehensive solution for managing library operations, including book management, user authentication, and borrowing and returning books.

## Project Overview

The project is divided into two main components:

- **Backend:** A robust and scalable backend developed with Spring Boot, providing RESTful APIs for all library operations. It handles business logic, data persistence, and security.
- **Admin Frontend:** A modern and user-friendly admin dashboard built with React, allowing librarians to manage books, users, and other library resources efficiently.
- **User Frontend:** A user-friendly interface for library members to browse, search, and borrow books.

## Project Structure

```
/
├── admin-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── sliit/
│   │   │   │           └── library/
│   │   │   │               ├── config/
│   │   │   │               ├── controller/
│   │   │   │               ├── dto/
│   │   │   │               ├── entity/
│   │   │   │               ├── exception/
│   │   │   │               ├── repository/
│   │   │   │               ├── scheduler/
│   │   │   │               ├── security/
│   │   │   │               └── service/
│   │   │   └── resources/
│   └── pom.xml
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── tests/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Features

### Backend (Spring Boot)

- **RESTful APIs:** A complete set of APIs for managing books, authors, categories, and users.
- **User Authentication:** Secure user authentication and authorization using JSON Web Tokens (JWT).
- **Data Persistence:** Integration with MySQL database using Spring Data JPA for efficient data storage and retrieval.
- **Validation:** Server-side validation of incoming data to ensure data integrity.
- **Email Service:** Integrated email service for sending notifications to users.

### User Frontend (React)

- **Book Browsing:** Browse and search for books in the library.
- **Book Details:** View detailed information about each book.
- **Borrowing:** Borrow books directly from the platform.
- **User Profile:** Manage user profile and view borrowing history.
- **React 18.2.0:** The JavaScript library for building the user interface.
- **Vite:** The build tool for the frontend application.
- **Axios:** For making HTTP requests to the backend APIs.
- **Bootstrap 5.3.2:** The CSS framework for designing the user interface.
- **React Router 6.20.1:** For handling routing and navigation in the application.

### Admin Frontend (React)

- **Dashboard:** An intuitive and responsive dashboard for managing library resources.
- **Book Management:** Add, edit, and delete books, authors, and categories.
- **User Management:** View and manage registered users.
- **Borrowing and Returning:** Manage the process of borrowing and returning books.
- **Fine Management:** Automatically calculate and manage fines for overdue books.
- **Reporting:** Generate reports on book popularity, user activity, and more.
- **Notifications:** Send notifications to users about due dates, reservations, and other important events.
- **E-books:** Manage and read e-books directly from the platform.
- **Reservations:** Reserve books that are currently unavailable.
- **Membership Management:** Manage user memberships and renewals.
- **Charts and Analytics:** Visual representation of library data using Chart.js.
- **Routing:** Seamless navigation between different sections of the admin panel using React Router.

## Technologies Used

### Backend

- **Java 17:** The core programming language for the backend.
- **Spring Boot 3.2.0:** The framework for building the backend application.
- **Spring Web:** For creating RESTful APIs.
- **Spring Data JPA:** For data persistence and interaction with the database.
- **Spring Security:** For implementing user authentication and authorization.
- **MySQL:** The relational database for storing library data.
- **Lombok:** To reduce boilerplate code in Java classes.
- **JWT:** For generating and validating JSON Web Tokens.
- **Maven:** The build automation tool for managing project dependencies and building the application.

### Admin Frontend

- **React 18.2.0:** The JavaScript library for building the user interface.
- **Vite:** The build tool for the frontend application.
- **Axios:** For making HTTP requests to the backend APIs.
- **Bootstrap 5.3.2:** The CSS framework for designing the user interface.
- **Chart.js 4.4.1:** For creating charts and visualizing data.
- **React Router 6.20.1:** For handling routing and navigation in the application.

## Getting Started

To get the project up and running on your local machine, follow these steps:

### Prerequisites

- **Java 17** or higher
- **Node.js 14** or higher
- **MySQL** database

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/online-library-management-system.git
   ```
2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
3. **Configure the database:**
   - Open `src/main/resources/application.properties` and update the database connection properties:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/your-database-name
     spring.datasource.username=your-database-username
     spring.datasource.password=your-database-password
     ```
4. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

### User Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install the dependencies:**
   ```bash
   npm install
   ```
3. **Run the application:**
   ```bash
   npm run dev
   ```

### Admin Frontend Setup

1. **Navigate to the admin-frontend directory:**
   ```bash
   cd admin-frontend
   ```
2. **Install the dependencies:**
   ```bash
   npm install
   ```
3. **Run the application:**
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! If you have any suggestions or find any issues, please feel free to open an issue or submit a pull request.
