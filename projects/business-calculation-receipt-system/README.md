# Business Calculation & Receipt System

A C++17 console application created for a practical business-calculation scenario.

## Features
- Product catalogue with IDs, names and prices
- Add products and quantities to cart
- Update quantities and remove items
- Strong numeric input validation
- Automatic subtotal calculation
- Tiered demo discount: 5% at RM100+, 10% at RM200+
- Configurable coursework service-tax calculation (currently 6%)
- Cash, card and e-wallet payment choices
- Cash-payment validation and change calculation
- Structured receipt with transaction number, date/time and customer name
- Receipt automatically saved to a `receipts/` folder when possible
- Cart clears after a successful transaction

## Build
```bash
g++ -std=c++17 -Wall -Wextra -pedantic main.cpp -o business_receipt
./business_receipt
```

On Windows (MinGW/MSYS2):
```bash
g++ -std=c++17 -Wall -Wextra -pedantic main.cpp -o business_receipt.exe
business_receipt.exe
```

## Notes
The 6% service-tax value is a demo/coursework configuration, not tax advice. Change `serviceTaxRate_` in `main.cpp` if the assignment requires another rate.
