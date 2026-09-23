#include <algorithm>
#include <chrono>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <sstream>
#include <string>
#include <vector>

class Product {
private:
    int id_{};
    std::string name_;
    double price_{};

public:
    Product(int id, std::string name, double price)
        : id_(id), name_(std::move(name)), price_(price) {}

    int id() const { return id_; }
    const std::string& name() const { return name_; }
    double price() const { return price_; }
};

class CartItem {
private:
    Product product_;
    int quantity_{};

public:
    CartItem(Product product, int quantity)
        : product_(std::move(product)), quantity_(quantity) {}

    const Product& product() const { return product_; }
    int quantity() const { return quantity_; }
    void setQuantity(int quantity) { quantity_ = quantity; }
    double lineTotal() const { return product_.price() * quantity_; }
};

class BusinessSystem {
private:
    std::vector<Product> catalog_;
    std::vector<CartItem> cart_;
    const double serviceTaxRate_ = 0.06; // Demo tax rate for this coursework system.
    int receiptCounter_ = 1001;

    static void clearInput() {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }

    static int readInt(const std::string& prompt, int minValue, int maxValue) {
        while (true) {
            std::cout << prompt;
            int value{};
            if (std::cin >> value && value >= minValue && value <= maxValue) {
                clearInput();
                return value;
            }
            std::cout << "Invalid input. Please enter a number from "
                      << minValue << " to " << maxValue << ".\n";
            clearInput();
        }
    }

    static double readMoney(const std::string& prompt, double minValue) {
        while (true) {
            std::cout << prompt;
            double value{};
            if (std::cin >> value && value >= minValue) {
                clearInput();
                return value;
            }
            std::cout << "Invalid amount. Please enter RM"
                      << std::fixed << std::setprecision(2) << minValue
                      << " or more.\n";
            clearInput();
        }
    }

    static std::string readLine(const std::string& prompt) {
        std::cout << prompt;
        std::string value;
        std::getline(std::cin, value);
        return value;
    }

    static std::string currentDateTime() {
        const auto now = std::chrono::system_clock::now();
        const std::time_t nowTime = std::chrono::system_clock::to_time_t(now);
        std::tm local{};
#if defined(_WIN32)
        localtime_s(&local, &nowTime);
#else
        localtime_r(&nowTime, &local);
#endif
        std::ostringstream out;
        out << std::put_time(&local, "%Y-%m-%d %H:%M:%S");
        return out.str();
    }

    const Product* findProduct(int id) const {
        const auto it = std::find_if(catalog_.begin(), catalog_.end(),
            [id](const Product& product) { return product.id() == id; });
        return it == catalog_.end() ? nullptr : &(*it);
    }

    CartItem* findCartItem(int productId) {
        const auto it = std::find_if(cart_.begin(), cart_.end(),
            [productId](const CartItem& item) {
                return item.product().id() == productId;
            });
        return it == cart_.end() ? nullptr : &(*it);
    }

    double subtotal() const {
        double total = 0.0;
        for (const auto& item : cart_) {
            total += item.lineTotal();
        }
        return total;
    }

    static double discountRate(double subtotalValue) {
        if (subtotalValue >= 200.0) return 0.10;
        if (subtotalValue >= 100.0) return 0.05;
        return 0.0;
    }

    void displayHeader() const {
        std::cout << "\n============================================================\n"
                  << "             EDWARD BUSINESS RECEIPT SYSTEM\n"
                  << "============================================================\n";
    }

    void displayCatalog() const {
        displayHeader();
        std::cout << std::left << std::setw(6) << "ID"
                  << std::setw(28) << "Product"
                  << std::right << std::setw(12) << "Price (RM)" << '\n';
        std::cout << std::string(46, '-') << '\n';
        for (const auto& product : catalog_) {
            std::cout << std::left << std::setw(6) << product.id()
                      << std::setw(28) << product.name()
                      << std::right << std::setw(12)
                      << std::fixed << std::setprecision(2)
                      << product.price() << '\n';
        }
        std::cout << "\nDiscount: 5% for RM100+, 10% for RM200+\n"
                  << "Demo service tax: " << std::fixed << std::setprecision(0)
                  << serviceTaxRate_ * 100 << "% after discount.\n";
    }

    void addItem() {
        displayCatalog();
        const int id = readInt("\nEnter product ID to add (1-8): ", 1, 8);
        const Product* product = findProduct(id);
        if (!product) {
            std::cout << "Product not found.\n";
            return;
        }

        const int qty = readInt("Enter quantity (1-99): ", 1, 99);
        if (CartItem* existing = findCartItem(id)) {
            const int newQty = std::min(99, existing->quantity() + qty);
            existing->setQuantity(newQty);
            std::cout << product->name() << " quantity updated to " << newQty << ".\n";
        } else {
            cart_.emplace_back(*product, qty);
            std::cout << product->name() << " added to cart.\n";
        }
    }

    void updateQuantity() {
        if (cart_.empty()) {
            std::cout << "\nCart is empty. Add a product first.\n";
            return;
        }
        displayCart();
        const int id = readInt("\nEnter product ID to update: ", 1, 8);
        CartItem* item = findCartItem(id);
        if (!item) {
            std::cout << "That product is not in the cart.\n";
            return;
        }
        const int qty = readInt("Enter new quantity (1-99): ", 1, 99);
        item->setQuantity(qty);
        std::cout << "Quantity updated successfully.\n";
    }

    void removeItem() {
        if (cart_.empty()) {
            std::cout << "\nCart is empty. Nothing to remove.\n";
            return;
        }
        displayCart();
        const int id = readInt("\nEnter product ID to remove: ", 1, 8);
        const auto oldSize = cart_.size();
        cart_.erase(std::remove_if(cart_.begin(), cart_.end(),
            [id](const CartItem& item) {
                return item.product().id() == id;
            }), cart_.end());
        std::cout << (cart_.size() < oldSize
            ? "Item removed successfully.\n"
            : "That product is not in the cart.\n");
    }

    void displayCart() const {
        displayHeader();
        if (cart_.empty()) {
            std::cout << "Cart is empty.\n";
            return;
        }

        std::cout << std::left << std::setw(5) << "ID"
                  << std::setw(24) << "Product"
                  << std::right << std::setw(10) << "Price"
                  << std::setw(8) << "Qty"
                  << std::setw(14) << "Line Total" << '\n';
        std::cout << std::string(61, '-') << '\n';

        for (const auto& item : cart_) {
            std::cout << std::left << std::setw(5) << item.product().id()
                      << std::setw(24) << item.product().name()
                      << std::right << std::setw(10) << std::fixed << std::setprecision(2)
                      << item.product().price()
                      << std::setw(8) << item.quantity()
                      << std::setw(14) << item.lineTotal() << '\n';
        }

        const double sub = subtotal();
        const double rate = discountRate(sub);
        const double discount = sub * rate;
        const double taxable = sub - discount;
        const double tax = taxable * serviceTaxRate_;
        const double grand = taxable + tax;

        std::cout << std::string(61, '-') << '\n'
                  << std::right << std::setw(47) << "Subtotal: RM "
                  << std::setw(10) << sub << '\n'
                  << std::setw(47) << "Discount: RM "
                  << std::setw(10) << discount << '\n'
                  << std::setw(47) << "Service tax: RM "
                  << std::setw(10) << tax << '\n'
                  << std::setw(47) << "Estimated total: RM "
                  << std::setw(10) << grand << '\n';
    }

    std::string buildReceipt(const std::string& customer,
                             const std::string& paymentMethod,
                             double cashPaid,
                             int receiptNo) const {
        const double sub = subtotal();
        const double rate = discountRate(sub);
        const double discount = sub * rate;
        const double taxable = sub - discount;
        const double tax = taxable * serviceTaxRate_;
        const double grand = taxable + tax;

        std::ostringstream out;
        out << std::fixed << std::setprecision(2);
        out << "============================================================\n"
            << "                 EDWARD BUSINESS RECEIPT\n"
            << "============================================================\n"
            << "Receipt No : TX" << receiptNo << '\n'
            << "Date/Time  : " << currentDateTime() << '\n'
            << "Customer   : " << (customer.empty() ? "Walk-in Customer" : customer) << '\n'
            << "Payment    : " << paymentMethod << '\n'
            << "------------------------------------------------------------\n"
            << std::left << std::setw(24) << "Item"
            << std::right << std::setw(9) << "Price"
            << std::setw(7) << "Qty"
            << std::setw(13) << "Amount" << '\n'
            << "------------------------------------------------------------\n";

        for (const auto& item : cart_) {
            out << std::left << std::setw(24) << item.product().name()
                << std::right << std::setw(9) << item.product().price()
                << std::setw(7) << item.quantity()
                << std::setw(13) << item.lineTotal() << '\n';
        }

        out << "------------------------------------------------------------\n"
            << std::right << std::setw(47) << "Subtotal: RM " << std::setw(10) << sub << '\n'
            << std::setw(47) << "Discount (" << std::setw(0)
            << static_cast<int>(rate * 100) << "%): RM " << std::setw(10) << discount << '\n'
            << std::setw(47) << "Service tax (6%): RM " << std::setw(10) << tax << '\n'
            << std::setw(47) << "TOTAL: RM " << std::setw(10) << grand << '\n';

        if (paymentMethod == "Cash") {
            out << std::setw(47) << "Cash paid: RM " << std::setw(10) << cashPaid << '\n'
                << std::setw(47) << "Change: RM " << std::setw(10) << (cashPaid - grand) << '\n';
        }

        out << "============================================================\n"
            << "           Thank you. Have a great day!\n"
            << "============================================================\n";
        return out.str();
    }

    void saveReceipt(const std::string& receipt, int receiptNo) const {
        try {
            std::filesystem::create_directories("receipts");
            const std::string fileName = "receipts/Receipt_TX" +
                std::to_string(receiptNo) + ".txt";
            std::ofstream file(fileName);
            if (file) {
                file << receipt;
                std::cout << "Receipt saved to " << fileName << "\n";
            } else {
                std::cout << "Receipt displayed successfully, but the file could not be saved.\n";
            }
        } catch (const std::exception&) {
            std::cout << "Receipt displayed successfully, but the receipt folder could not be created.\n";
        }
    }

    void checkout() {
        if (cart_.empty()) {
            std::cout << "\nCart is empty. Add products before checkout.\n";
            return;
        }

        displayCart();
        const std::string customer = readLine("\nCustomer name (press Enter for walk-in): ");
        std::cout << "\nPayment method\n"
                  << "1. Cash\n2. Card\n3. E-Wallet\n";
        const int paymentChoice = readInt("Choose payment method (1-3): ", 1, 3);
        const std::string paymentMethod =
            paymentChoice == 1 ? "Cash" :
            paymentChoice == 2 ? "Card" : "E-Wallet";

        const double sub = subtotal();
        const double discount = sub * discountRate(sub);
        const double grand = (sub - discount) * (1.0 + serviceTaxRate_);
        double cashPaid = 0.0;
        if (paymentMethod == "Cash") {
            cashPaid = readMoney("Cash received (RM): ", grand);
        }

        const int receiptNo = receiptCounter_++;
        const std::string receipt = buildReceipt(customer, paymentMethod, cashPaid, receiptNo);
        std::cout << '\n' << receipt;
        saveReceipt(receipt, receiptNo);
        cart_.clear();
        std::cout << "Transaction completed. Cart has been cleared.\n";
    }

public:
    BusinessSystem()
        : catalog_ {
            Product(1, "Notebook", 8.90),
            Product(2, "Gel Pen Set", 12.50),
            Product(3, "USB-C Cable", 19.90),
            Product(4, "Wireless Mouse", 39.90),
            Product(5, "Laptop Stand", 59.90),
            Product(6, "Power Bank", 79.90),
            Product(7, "Mechanical Keyboard", 129.90),
            Product(8, "Bluetooth Speaker", 149.90)
        } {}

    void run() {
        while (true) {
            displayHeader();
            std::cout << "1. View product catalog\n"
                      << "2. Add product to cart\n"
                      << "3. View cart\n"
                      << "4. Update item quantity\n"
                      << "5. Remove item from cart\n"
                      << "6. Checkout & generate receipt\n"
                      << "7. Exit\n";

            const int choice = readInt("\nChoose an option (1-7): ", 1, 7);
            switch (choice) {
                case 1: displayCatalog(); break;
                case 2: addItem(); break;
                case 3: displayCart(); break;
                case 4: updateQuantity(); break;
                case 5: removeItem(); break;
                case 6: checkout(); break;
                case 7:
                    std::cout << "\nSystem closed. Thank you!\n";
                    return;
            }

            readLine("\nPress Enter to continue...");
        }
    }
};

int main() {
    BusinessSystem system;
    system.run();
    return 0;
}
