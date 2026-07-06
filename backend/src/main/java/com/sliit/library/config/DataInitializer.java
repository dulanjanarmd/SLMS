package com.sliit.library.config;

import com.sliit.library.entity.*;
import com.sliit.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private MemberTypeRepository memberTypeRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedFaculties();
        seedMemberTypes();
        seedCategories();
        seedUsers();
        seedBooks();
    }

    private void seedFaculties() {
        if (facultyRepository.count() > 0) return;
        facultyRepository.saveAll(List.of(
            Faculty.builder().name("Faculty of Computing").code("FOC").build(),
            Faculty.builder().name("Faculty of Engineering").code("FOE").build(),
            Faculty.builder().name("Faculty of Business").code("FOB").build(),
            Faculty.builder().name("Faculty of Humanities & Sciences").code("FOHS").build(),
            Faculty.builder().name("Faculty of Architecture").code("FOA").build(),
            Faculty.builder().name("Faculty of Graduate Studies & Research").code("FGSR").build()
        ));
    }

    private void seedMemberTypes() {
        if (memberTypeRepository.count() > 0) return;
        memberTypeRepository.saveAll(List.of(
            MemberType.builder().name("Undergraduate Student").build(),
            MemberType.builder().name("Postgraduate Student").build(),
            MemberType.builder().name("Academic Staff").build(),
            MemberType.builder().name("Non-Academic Staff").build(),
            MemberType.builder().name("External Member").build(),
            MemberType.builder().name("Research Scholar").build()
        ));
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        categoryRepository.saveAll(List.of(
            Category.builder().name("Computer Science").description("Programming, algorithms, software engineering").ddcClass("004").build(),
            Category.builder().name("Information Technology").description("Networks, databases, IT systems").ddcClass("005").build(),
            Category.builder().name("Electrical Engineering").description("Circuit design, electronics, power systems").ddcClass("621").build(),
            Category.builder().name("Civil Engineering").description("Structural, environmental, geotechnical engineering").ddcClass("624").build(),
            Category.builder().name("Mechanical Engineering").description("Thermodynamics, fluid mechanics, manufacturing").ddcClass("620").build(),
            Category.builder().name("Business Management").description("Management, strategy, organizational behavior").ddcClass("658").build(),
            Category.builder().name("Accounting & Finance").description("Financial accounting, auditing, corporate finance").ddcClass("657").build(),
            Category.builder().name("Mathematics").description("Calculus, statistics, discrete mathematics").ddcClass("510").build(),
            Category.builder().name("Physics").description("Classical mechanics, quantum physics, optics").ddcClass("530").build(),
            Category.builder().name("English Language").description("Grammar, literature, academic writing").ddcClass("420").build(),
            Category.builder().name("Architecture & Design").description("Architectural design, urban planning, interior design").ddcClass("720").build(),
            Category.builder().name("Data Science & AI").description("Machine learning, data analytics, artificial intelligence").ddcClass("006").build()
        ));
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;
        userRepository.saveAll(List.of(
            User.builder()
                .fullName("System Administrator")
                .studentStaffId("ADMIN001")
                .email("admin@sliit.lk")
                .phoneNumber("0112345678")
                .password(passwordEncoder.encode("Admin@2024"))
                .role(Role.ADMIN)
                .isActive(true).currentBorrowCount(0).outstandingFine(0.0)
                .build(),

            User.builder()
                .fullName("K.D. Perera")
                .studentStaffId("LIB001")
                .email("librarian@sliit.lk")
                .phoneNumber("0112345679")
                .password(passwordEncoder.encode("Lib@2024"))
                .role(Role.LIBRARIAN)
                .isActive(true).currentBorrowCount(0).outstandingFine(0.0)
                .build(),

            User.builder()
                .fullName("A.M. Silva")
                .studentStaffId("IT21234567")
                .email("it21234567@my.sliit.lk")
                .phoneNumber("0771234567")
                .faculty("Faculty of Computing")
                .programme("BSc (Hons) Information Technology")
                .password(passwordEncoder.encode("Student@2024"))
                .role(Role.STUDENT)
                .isActive(true).currentBorrowCount(0).outstandingFine(0.0)
                .build(),

            User.builder()
                .fullName("R.P. Fernando")
                .studentStaffId("IT21345678")
                .email("it21345678@my.sliit.lk")
                .phoneNumber("0772345678")
                .faculty("Faculty of Computing")
                .programme("BSc (Hons) Computer Science")
                .password(passwordEncoder.encode("Student@2024"))
                .role(Role.STUDENT)
                .isActive(true).currentBorrowCount(0).outstandingFine(0.0)
                .build(),

            User.builder()
                .fullName("Dr. S.K. Jayawardena")
                .studentStaffId("FAC001")
                .email("s.jayawardena@sliit.lk")
                .phoneNumber("0113456789")
                .faculty("Faculty of Computing")
                .programme("Department of Computer Science")
                .password(passwordEncoder.encode("Faculty@2024"))
                .role(Role.FACULTY)
                .isActive(true).currentBorrowCount(0).outstandingFine(0.0)
                .build(),

            User.builder()
                .fullName("Prof. N.D. Wickramasinghe")
                .studentStaffId("FAC002")
                .email("n.wickramasinghe@sliit.lk")
                .phoneNumber("0113456790")
                .faculty("Faculty of Engineering")
                .programme("Department of Electrical Engineering")
                .password(passwordEncoder.encode("Faculty@2024"))
                .role(Role.FACULTY)
                .isActive(true).currentBorrowCount(0).outstandingFine(0.0)
                .build()
        ));
    }

    private void seedBooks() {
        if (bookRepository.count() > 0) return;

        Category cs = categoryRepository.findByName("Computer Science").orElse(null);
        Category it = categoryRepository.findByName("Information Technology").orElse(null);
        Category ee = categoryRepository.findByName("Electrical Engineering").orElse(null);
        Category bm = categoryRepository.findByName("Business Management").orElse(null);
        Category math = categoryRepository.findByName("Mathematics").orElse(null);
        Category ds = categoryRepository.findByName("Data Science & AI").orElse(null);
        Category eng = categoryRepository.findByName("English Language").orElse(null);

        bookRepository.saveAll(List.of(
            // Computer Science
            Book.builder()
                .title("Introduction to Algorithms")
                .author("Thomas H. Cormen")
                .additionalAuthors("Charles E. Leiserson, Ronald L. Rivest, Clifford Stein")
                .isbn("9780262033848")
                .publisher("MIT Press")
                .publicationYear(2022)
                .edition("4th Edition")
                .language("English")
                .shelfLocation("CS-A01")
                .ddcNumber("005.1")
                .accessionNumber("ACC001")
                .totalCopies(3).availableCopies(3).reservedCopies(0)
                .replacementCost(8500.0)
                .status(BookStatus.AVAILABLE)
                .category(cs)
                .acquisitionDate(LocalDate.of(2023, 1, 15))
                .borrowCount(0)
                .description("Comprehensive introduction to algorithms and data structures used in computer science.")
                .build(),

            Book.builder()
                .title("Clean Code: A Handbook of Agile Software Craftsmanship")
                .author("Robert C. Martin")
                .isbn("9780132350884")
                .publisher("Prentice Hall")
                .publicationYear(2008)
                .edition("1st Edition")
                .language("English")
                .shelfLocation("CS-A02")
                .ddcNumber("005.1")
                .accessionNumber("ACC002")
                .totalCopies(2).availableCopies(2).reservedCopies(0)
                .replacementCost(6500.0)
                .status(BookStatus.AVAILABLE)
                .category(cs)
                .acquisitionDate(LocalDate.of(2023, 2, 10))
                .borrowCount(0)
                .description("Best practices for writing clean, maintainable code.")
                .build(),

            Book.builder()
                .title("Design Patterns: Elements of Reusable Object-Oriented Software")
                .author("Erich Gamma")
                .additionalAuthors("Richard Helm, Ralph Johnson, John Vlissides")
                .isbn("9780201633610")
                .publisher("Addison-Wesley")
                .publicationYear(1994)
                .edition("1st Edition")
                .language("English")
                .shelfLocation("CS-A03")
                .ddcNumber("005.1")
                .accessionNumber("ACC003")
                .totalCopies(2).availableCopies(2).reservedCopies(0)
                .replacementCost(7200.0)
                .status(BookStatus.AVAILABLE)
                .category(cs)
                .acquisitionDate(LocalDate.of(2022, 6, 20))
                .borrowCount(0)
                .description("Classic reference on software design patterns.")
                .build(),

            Book.builder()
                .title("The Pragmatic Programmer: Your Journey to Mastery")
                .author("David Thomas")
                .additionalAuthors("Andrew Hunt")
                .isbn("9780135957059")
                .publisher("Addison-Wesley")
                .publicationYear(2019)
                .edition("20th Anniversary Edition")
                .language("English")
                .shelfLocation("CS-A04")
                .ddcNumber("005.1")
                .accessionNumber("ACC004")
                .totalCopies(2).availableCopies(2).reservedCopies(0)
                .replacementCost(7000.0)
                .status(BookStatus.AVAILABLE)
                .category(cs)
                .acquisitionDate(LocalDate.of(2023, 3, 5))
                .borrowCount(0)
                .description("Practical advice for software developers on becoming more effective.")
                .build(),

            // Information Technology
            Book.builder()
                .title("Computer Networking: A Top-Down Approach")
                .author("James F. Kurose")
                .additionalAuthors("Keith W. Ross")
                .isbn("9780136681557")
                .publisher("Pearson")
                .publicationYear(2021)
                .edition("8th Edition")
                .language("English")
                .shelfLocation("IT-B01")
                .ddcNumber("004.6")
                .accessionNumber("ACC005")
                .totalCopies(4).availableCopies(4).reservedCopies(0)
                .replacementCost(9000.0)
                .status(BookStatus.AVAILABLE)
                .category(it)
                .acquisitionDate(LocalDate.of(2023, 4, 12))
                .borrowCount(0)
                .description("Comprehensive guide to computer networking from application to physical layer.")
                .build(),

            Book.builder()
                .title("Database System Concepts")
                .author("Abraham Silberschatz")
                .additionalAuthors("Henry F. Korth, S. Sudarshan")
                .isbn("9780078022159")
                .publisher("McGraw-Hill")
                .publicationYear(2019)
                .edition("7th Edition")
                .language("English")
                .shelfLocation("IT-B02")
                .ddcNumber("005.74")
                .accessionNumber("ACC006")
                .totalCopies(3).availableCopies(3).reservedCopies(0)
                .replacementCost(8800.0)
                .status(BookStatus.AVAILABLE)
                .category(it)
                .acquisitionDate(LocalDate.of(2023, 1, 20))
                .borrowCount(0)
                .description("Fundamental concepts of database systems including SQL, transactions, and storage.")
                .build(),

            Book.builder()
                .title("Operating System Concepts")
                .author("Abraham Silberschatz")
                .additionalAuthors("Peter B. Galvin, Greg Gagne")
                .isbn("9781119800361")
                .publisher("Wiley")
                .publicationYear(2021)
                .edition("10th Edition")
                .language("English")
                .shelfLocation("IT-B03")
                .ddcNumber("005.43")
                .accessionNumber("ACC007")
                .totalCopies(3).availableCopies(3).reservedCopies(0)
                .replacementCost(9200.0)
                .status(BookStatus.AVAILABLE)
                .category(it)
                .acquisitionDate(LocalDate.of(2023, 5, 8))
                .borrowCount(0)
                .description("Comprehensive coverage of operating system principles and design.")
                .build(),

            // Data Science & AI
            Book.builder()
                .title("Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow")
                .author("Aurélien Géron")
                .isbn("9781098125974")
                .publisher("O'Reilly Media")
                .publicationYear(2022)
                .edition("3rd Edition")
                .language("English")
                .shelfLocation("DS-C01")
                .ddcNumber("006.31")
                .accessionNumber("ACC008")
                .totalCopies(2).availableCopies(2).reservedCopies(0)
                .replacementCost(9500.0)
                .status(BookStatus.AVAILABLE)
                .category(ds)
                .acquisitionDate(LocalDate.of(2023, 6, 15))
                .borrowCount(0)
                .description("Practical guide to machine learning using Python frameworks.")
                .build(),

            Book.builder()
                .title("Deep Learning")
                .author("Ian Goodfellow")
                .additionalAuthors("Yoshua Bengio, Aaron Courville")
                .isbn("9780262035613")
                .publisher("MIT Press")
                .publicationYear(2016)
                .edition("1st Edition")
                .language("English")
                .shelfLocation("DS-C02")
                .ddcNumber("006.31")
                .accessionNumber("ACC009")
                .totalCopies(2).availableCopies(2).reservedCopies(0)
                .replacementCost(8700.0)
                .status(BookStatus.AVAILABLE)
                .category(ds)
                .acquisitionDate(LocalDate.of(2022, 9, 10))
                .borrowCount(0)
                .description("Comprehensive textbook on deep learning theory and applications.")
                .build(),

            // Electrical Engineering
            Book.builder()
                .title("Electric Circuits")
                .author("James W. Nilsson")
                .additionalAuthors("Susan Riedel")
                .isbn("9780134746968")
                .publisher("Pearson")
                .publicationYear(2018)
                .edition("11th Edition")
                .language("English")
                .shelfLocation("EE-D01")
                .ddcNumber("621.3")
                .accessionNumber("ACC010")
                .totalCopies(3).availableCopies(3).reservedCopies(0)
                .replacementCost(8200.0)
                .status(BookStatus.AVAILABLE)
                .category(ee)
                .acquisitionDate(LocalDate.of(2022, 11, 5))
                .borrowCount(0)
                .description("Fundamental principles of electric circuit analysis.")
                .build(),

            // Business Management
            Book.builder()
                .title("Principles of Management")
                .author("P.C. Tripathi")
                .additionalAuthors("P.N. Reddy")
                .isbn("9780070702219")
                .publisher("McGraw-Hill Education")
                .publicationYear(2017)
                .edition("6th Edition")
                .language("English")
                .shelfLocation("BM-E01")
                .ddcNumber("658")
                .accessionNumber("ACC011")
                .totalCopies(4).availableCopies(4).reservedCopies(0)
                .replacementCost(5500.0)
                .status(BookStatus.AVAILABLE)
                .category(bm)
                .acquisitionDate(LocalDate.of(2023, 2, 28))
                .borrowCount(0)
                .description("Core principles and practices of modern management.")
                .build(),

            Book.builder()
                .title("Strategic Management: Concepts and Cases")
                .author("Fred R. David")
                .additionalAuthors("Forest R. David")
                .isbn("9780134153971")
                .publisher("Pearson")
                .publicationYear(2016)
                .edition("16th Edition")
                .language("English")
                .shelfLocation("BM-E02")
                .ddcNumber("658.4")
                .accessionNumber("ACC012")
                .totalCopies(2).availableCopies(2).reservedCopies(0)
                .replacementCost(7800.0)
                .status(BookStatus.AVAILABLE)
                .category(bm)
                .acquisitionDate(LocalDate.of(2023, 3, 18))
                .borrowCount(0)
                .description("Comprehensive guide to strategic management with real-world case studies.")
                .build(),

            // Mathematics
            Book.builder()
                .title("Calculus: Early Transcendentals")
                .author("James Stewart")
                .isbn("9781285741550")
                .publisher("Cengage Learning")
                .publicationYear(2015)
                .edition("8th Edition")
                .language("English")
                .shelfLocation("MA-F01")
                .ddcNumber("515")
                .accessionNumber("ACC013")
                .totalCopies(5).availableCopies(5).reservedCopies(0)
                .replacementCost(9800.0)
                .status(BookStatus.AVAILABLE)
                .category(math)
                .acquisitionDate(LocalDate.of(2022, 8, 22))
                .borrowCount(0)
                .description("Standard calculus textbook covering single and multivariable calculus.")
                .build(),

            Book.builder()
                .title("Discrete Mathematics and Its Applications")
                .author("Kenneth H. Rosen")
                .isbn("9781259676512")
                .publisher("McGraw-Hill")
                .publicationYear(2018)
                .edition("8th Edition")
                .language("English")
                .shelfLocation("MA-F02")
                .ddcNumber("511")
                .accessionNumber("ACC014")
                .totalCopies(3).availableCopies(3).reservedCopies(0)
                .replacementCost(8400.0)
                .status(BookStatus.AVAILABLE)
                .category(math)
                .acquisitionDate(LocalDate.of(2023, 1, 30))
                .borrowCount(0)
                .description("Comprehensive coverage of discrete mathematics for computer science students.")
                .build(),

            // English
            Book.builder()
                .title("Academic Writing for Graduate Students")
                .author("John M. Swales")
                .additionalAuthors("Christine B. Feak")
                .isbn("9780472034758")
                .publisher("University of Michigan Press")
                .publicationYear(2012)
                .edition("3rd Edition")
                .language("English")
                .shelfLocation("EN-G01")
                .ddcNumber("808.02")
                .accessionNumber("ACC015")
                .totalCopies(3).availableCopies(3).reservedCopies(0)
                .replacementCost(4500.0)
                .status(BookStatus.AVAILABLE)
                .category(eng)
                .acquisitionDate(LocalDate.of(2022, 7, 14))
                .borrowCount(0)
                .description("Essential guide for academic writing in graduate-level studies.")
                .build()
        ));
    }
}
