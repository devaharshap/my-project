package com.ecommerce.config;

import com.ecommerce.entity.*;
import com.ecommerce.entity.enums.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random(42);

    private static final String[][] CATEGORIES = {
        {"Electronics", "electronic-devices"},
        {"Computers & Laptops", "computers-laptops"},
        {"Smartphones", "smartphones"},
        {"Clothing", "clothing"},
        {"Men's Clothing", "mens-clothing"},
        {"Women's Clothing", "womens-clothing"},
        {"Shoes", "shoes"},
        {"Books", "books"},
        {"Toys & Games", "toys-games"},
        {"Sports & Outdoors", "sports-outdoors"},
        {"Home & Kitchen", "home-kitchen"},
        {"Beauty & Personal Care", "beauty-personal-care"},
        {"Jewelry", "jewelry"},
        {"Automotive", "automotive"},
        {"Garden & Outdoor", "garden-outdoor"},
        {"Pet Supplies", "pet-supplies"},
        {"Health & Wellness", "health-wellness"},
        {"Office Supplies", "office-supplies"},
        {"Musical Instruments", "musical-instruments"},
        {"Food & Grocery", "food-grocery"}
    };

    private static final String[] FIRST_NAMES = {"James", "Mary", "Robert", "Patricia", "John", "Jennifer",
        "Michael", "Linda", "William", "Barbara", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah",
        "Thomas", "Karen", "Charles", "Lisa", "Christopher", "Nancy", "Daniel", "Betty", "Matthew", "Margaret",
        "Anthony", "Sandra", "Mark", "Ashley", "Donald", "Dorothy", "Steven", "Kimberly", "Paul", "Emily",
        "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Melissa",
        "George", "Deborah", "Timothy", "Stephanie"};

    private static final String[] LAST_NAMES = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
        "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
        "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris",
        "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright",
        "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall",
        "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"};

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 2) {
            log.info("Database already seeded, skipping.");
            return;
        }
        log.info("Seeding database...");
        seedCategories();
        seedAdminUser();
        seedUsers(100);
        seedProducts(1000);
        seedOrders(500);
        log.info("Database seeding complete.");
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        for (String[] cat : CATEGORIES) {
            categoryRepository.save(Category.builder()
                    .name(cat[0]).slug(cat[1])
                    .description("Browse our " + cat[0] + " collection")
                    .imageUrl("https://picsum.photos/seed/" + cat[1] + "/400/300")
                    .build());
        }
        log.info("Seeded {} categories", CATEGORIES.length);
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail("admin@ecommerce.com")) return;
        Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElseThrow();
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER).orElseThrow();
        User admin = User.builder()
                .email("admin@ecommerce.com")
                .password(passwordEncoder.encode("Admin@123"))
                .firstName("Admin").lastName("User")
                .roles(Set.of(adminRole, customerRole))
                .emailVerified(true)
                .build();
        userRepository.save(admin);
        log.info("Admin user created: admin@ecommerce.com / Admin@123");
    }

    private void seedUsers(int count) {
        if (userRepository.count() > 2) return;
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER).orElseThrow();
        String encodedPassword = passwordEncoder.encode("Password@123");
        List<User> users = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            User user = User.builder()
                    .email("user" + i + "@ecommerce.com")
                    .password(encodedPassword)
                    .firstName(firstName).lastName(lastName)
                    .phone("+1-555-" + String.format("%07d", random.nextInt(9999999)))
                    .roles(Set.of(customerRole))
                    .emailVerified(true)
                    .build();
            users.add(user);
        }
        userRepository.saveAll(users);
        log.info("Seeded {} users (password: Password@123)", count);
    }

    private void seedProducts(int count) {
        if (productRepository.count() > 0) return;
        List<Category> categories = categoryRepository.findAll();
        String[] adjectives = {"Premium", "Ultra", "Pro", "Smart", "Classic", "Modern", "Deluxe", "Elite", "Super", "Advanced"};
        String[] nouns = {"Series", "Edition", "Collection", "Pack", "Set", "Kit", "Bundle", "Line", "Range", "Model"};

        List<Product> products = new ArrayList<>();
        List<Inventory> inventories = new ArrayList<>();

        for (int i = 1; i <= count; i++) {
            Category category = categories.get(i % categories.size());
            String adjective = adjectives[random.nextInt(adjectives.length)];
            String noun = nouns[random.nextInt(nouns.length)];
            BigDecimal price = BigDecimal.valueOf(9.99 + random.nextInt(990)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal originalPrice = random.nextBoolean() ? price.multiply(BigDecimal.valueOf(1.2)).setScale(2, RoundingMode.HALF_UP) : null;
            BigDecimal rating = BigDecimal.valueOf(3.0 + random.nextDouble() * 2.0).setScale(1, RoundingMode.HALF_UP);

            Product product = Product.builder()
                    .name(adjective + " " + category.getName() + " " + noun + " " + i)
                    .description("High-quality " + category.getName().toLowerCase() + " product. " + adjective + " quality guaranteed.")
                    .price(price).originalPrice(originalPrice)
                    .sku("SKU-" + String.format("%06d", i))
                    .imageUrl("https://picsum.photos/seed/prod" + i + "/400/400")
                    .category(category).rating(rating)
                    .reviewCount(random.nextInt(500))
                    .featured(i <= 50)
                    .build();
            products.add(product);
        }
        productRepository.saveAll(products);

        for (Product p : products) {
            inventories.add(Inventory.builder()
                    .product(p).quantity(10 + random.nextInt(200)).build());
        }
        inventoryRepository.saveAll(inventories);
        log.info("Seeded {} products with inventory", count);
    }

    private void seedOrders(int count) {
        if (orderRepository.count() > 0) return;
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().noneMatch(r -> r.getName() == RoleName.ADMIN))
                .toList();
        List<Product> products = productRepository.findAll();
        OrderStatus[] statuses = {OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING, OrderStatus.CONFIRMED, OrderStatus.CANCELLED};
        PaymentMethod[] methods = PaymentMethod.values();

        for (int i = 1; i <= count; i++) {
            User user = users.get(random.nextInt(users.size()));
            int itemCount = 1 + random.nextInt(4);
            BigDecimal subtotal = BigDecimal.ZERO;

            Address address = Address.builder()
                    .user(user).street((100 + random.nextInt(9900)) + " Main St")
                    .city("Springfield").state("IL").zipCode("62701").country("US")
                    .build();
            addressRepository.save(address);

            Order order = Order.builder()
                    .orderNumber("ORD-" + String.format("%08d", i))
                    .user(user).address(address)
                    .status(statuses[random.nextInt(statuses.length)])
                    .tax(BigDecimal.ZERO).shippingCost(BigDecimal.valueOf(5.99))
                    .subtotal(BigDecimal.ZERO).totalAmount(BigDecimal.ZERO)
                    .build();

            List<OrderItem> items = new ArrayList<>();
            for (int j = 0; j < itemCount; j++) {
                Product product = products.get(random.nextInt(products.size()));
                int qty = 1 + random.nextInt(3);
                BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(qty));
                subtotal = subtotal.add(itemTotal);
                items.add(OrderItem.builder()
                        .order(order).product(product)
                        .productName(product.getName())
                        .quantity(qty).price(product.getPrice()).total(itemTotal)
                        .build());
            }
            BigDecimal tax = subtotal.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
            order.setSubtotal(subtotal);
            order.setTax(tax);
            order.setTotalAmount(subtotal.add(tax).add(order.getShippingCost()));
            order.setItems(items);

            Order savedOrder = orderRepository.save(order);

            PaymentStatus pStatus = order.getStatus() == OrderStatus.CANCELLED ? PaymentStatus.REFUNDED : PaymentStatus.COMPLETED;
            paymentRepository.save(Payment.builder()
                    .order(savedOrder).amount(savedOrder.getTotalAmount())
                    .status(pStatus).method(methods[random.nextInt(methods.length)])
                    .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                    .build());
        }
        log.info("Seeded {} orders", count);
    }
}
