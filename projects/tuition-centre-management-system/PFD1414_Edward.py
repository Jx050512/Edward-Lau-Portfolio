def display_public_holiday(Malaysian_Public_Holidays):
    print("Public Holiday")
    print("{:<25} | {:<10} | {:<10} | {:<5}".format("Holiday", "Day", "Month", "Year"))
    for holiday, date in Malaysian_Public_Holidays.items():
        parts = date.split()
        day = parts[0]
        month = parts[1]
        year = parts[2]
        print("{:<25} | {:<10} | {:<10} | {:<5}".format(holiday, day, month, year))

def display_tuition_schedule(tuition_service, tuition_day, subject_code_map):
    for level, subjects in tuition_service.items():
        print(f"{level} Tuition Schedule:")
        for subject, fee in subjects.items():
            code = subject_code_map.get(subject.lower())
            if code and code in tuition_day:
                day = " ".join(tuition_day[code]['days'])
                subject = tuition_day[code]['subject']
                print(f"{subject:<18} | Fee: RM{fee:<3} | Day: {day}")

def get_student_info():
    name = input("Enter your name: ")
    phone = input("Enter your phone number: ")
    parent_name = input("Enter your parent name: ")
    emergency_contact = input("Enter your emergency contact: ")
    return name, phone,parent_name, emergency_contact

def get_student_level(tuition_service):
    print("Level: UPSR, PT3, SPM")
    while True:
        level = input("Enter your level: ").upper()
        if level not in tuition_service:
            print("Invalid level, please try again (UPSR, PT3, SPM).")
        else:
            return level

def select_subjects(level, tuition_service):
    print(f"Available subjects for {level}:")
    for subject in tuition_service[level]:
        print(f"- {subject} (RM{tuition_service[level][subject]})")

    while True:
        input_subjects = input("Enter your subjects (comma-separated): ").strip().lower()
        selected = [subject.strip().title() for subject in input_subjects.split(",")]
        valid = []
        total_fee = 0
        for subject in selected:
            if subject in tuition_service[level]:
                valid.append(subject)
                total_fee += tuition_service[level][subject]
        if valid:
            return valid, total_fee
        else:
            print("No valid subjects selected. Please try again.")

def calculate_discount(total_fee, selected_subjects, tuition_package):
    count = len(selected_subjects)
    if count == 2:
        package = 'BASIC'
    elif count == 3:
        package = 'STANDARD'
    elif count >= 4:
        package = 'PREMIUM'
    else:
        package = None

    discount_rate = tuition_package[package]['discount'] if package else 0
    discount = total_fee * discount_rate
    final_fee = total_fee - discount
    return package,discount,final_fee

def generate_invoice(name, phone, parent_name, emergency_contact, level, selected_subjects,
                     tuition_service, tuition_day, subject_code_map, total_fee, discount,
                     final_fee,package,tuition_package):
    print("\n===== INVOICE =====")
    print(f"Name: {name}")
    print(f"Phone: {phone}")
    print(f"Parent Name: {parent_name}")
    print(f"Emergency Contact: {emergency_contact}")
    print(f"Level: {level}")
    print("Subjects selected and schedule:")
    for sub in selected_subjects:
        code = subject_code_map.get(sub.lower())
        if code and code in tuition_day:
            day = ", ".join(tuition_day[code]['days'])
        else:
            day = "N/A"
        print(f" - {sub}: RM{tuition_service[level][sub]} | Class Day: {day}")
    print(f"Total Fee    : RM{total_fee:.2f}")
    print(f"Discount     : RM{discount:.2f}")
    print(f"Amount to Pay: RM{final_fee:.2f}")

    if package:
        print(f"Package: {tuition_package[package]['name']}")
    else:
        print("Package: No discount package applied")
    print("=====================")

#Static Data
Malaysian_Public_Holidays = { "New Year's Day": "01 January 2024",
                       "Chinese New Year": "10-11 February 2024",
                       "Hari Raya Aidilfitri":"10-11 April 2024",
                       "Labour Day": "01 May 2024",
                       "Wesak Day": "23 May 2024",
                       "Hari Raya Haji": "16 June 2024",
                       "National Day": "31 August 2024",
                       "Malaysia Day": "16 September 2024",
                       "Deepawali": "01 November 2024",
                       "Christmas": "25 December 2024" }

tuition_service = {"UPSR": {"Math": 80, "BM": 70, "Science": 85, "English": 75},
                   "PT3": {"Math": 90, "Sejarah": 80, "Geography": 80, "Science": 90, "English":90},
                   "SPM": {"Add Math": 120, "Physics": 130, "Chemistry": 125, "English": 100}}

tuition_day = {"BM":{'subject':'Bahasa Melayu','days':['Mon']},
               "MATH":{'subject':'Mathematics','days':['Tue']},
               "SCI":{'subject':'Science','days':['Wed']},
               "ENG":{'subject':'English','days':['Thu']},
               "SEJ":{'subject':'Sejarah','days':['Fri']},
               "GEO":{'subject':'Geography','days':['Sat']},
               "ADD MATH":{'subject':'Add Math','days':['Tue']},
               "PHY":{'subject':'Physics','days':['Mon']},
               "CHE":{'subject':'Chemistry','days':['Fri']}}

subject_code_map = {"math": "MATH",
                    "bm": "BM",
                    "science": "SCI",
                    "english": "ENG",
                    "sejarah": "SEJ",
                    "geography": "GEO",
                    "add math": "ADD MATH",
                    "physics": "PHY",
                    "chemistry": "CHE"}

tuition_package = {'BASIC': {'name': 'Basic Package (2 subjects)', 'discount': 0.1},
            'STANDARD': {'name': 'Standard Package (3 subjects)', 'discount': 0.15},
            'PREMIUM': {'name': 'Premium Package (all subjects)', 'discount': 0.2}}

#Main System
print("Tuition Center Management System")
display_public_holiday(Malaysian_Public_Holidays)
display_tuition_schedule(tuition_service, tuition_day, subject_code_map)

while True:
    name, phone, parent_name, emergency_contact = get_student_info()
    level = get_student_level(tuition_service)
    selected_subjects, total_fee = select_subjects(level, tuition_service)
    package, discount, final_fee = calculate_discount(total_fee, selected_subjects, tuition_package)
    generate_invoice(name, phone, parent_name, emergency_contact, level, selected_subjects, tuition_service,
                     tuition_day, subject_code_map, total_fee, discount, final_fee,package,tuition_package)

    while True:
        cont = input("\nDo you want to register another student? (yes/no): ").strip().lower()
        if cont in ['yes', 'no']:
            break
        else:
            print("Please enter 'yes' or 'no'.")

    if cont == 'no':
        print("\nRegistration complete. Thank you!")
        break