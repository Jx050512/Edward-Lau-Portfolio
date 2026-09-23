#Student Management System
#Task 1: Collect and Store Student Data
students = {}
print("Student Data Collection")

while True:
    name = input("Enter student name (or 'done to finish):").strip()
    if name.lower() == "done":
        break

    #Input validation for marks
    while True:
        marks_input = input(f"Enter marks for {name} (0-100): ")
        if marks_input.isdigit():
            marks = int(marks_input)
            if 0 <= marks <= 100:
                break
            else:
                print("Marks must be between 0 and 100")
        else:
            print("Please enter a valid number")

    students[name] = marks

print("Student data collected successfully!")
print("Current student records:", students)

#Task 2: Grade Conversion
print("Grade Conversion")
grade_scale = {'A':(90,100),'B':(80,89),'C':(70,79),'D':(60,69),'E':(50,59),'F':(0,49)}

print("Student Report:")
print("{:<20} {:<10} {:<5}".format("Name", "Marks", "Grade"))

for name, marks in students.items():
    if marks >= 90:
        grade = 'A'
    elif marks >= 80:
        grade = 'B'
    elif marks >= 70:
        grade = 'C'
    elif marks >= 60:
        grade = 'D'
    elif marks >= 50:
        grade = 'E'
    else:
        grade = 'F'

    print("{:<20} {:<10} {:<5}".format(name, marks, grade))

#Task 3: Search Feature
print("Student Search")
search_name = input("Enter student name to search):").strip().lower()

found = False
for name in students.keys():
    #Case-insensitive search and partial match
    if search_name in name.lower():
        print(f"Found: {name} - Marks: {students[name]}")
        found = True

if not found:
    print("No matching student found.")

#Task 4: Summary Report
print("Summary Report")

#Convert marks to list for calculations
marks_list = list(students.values())
total_students = len(marks_list)
average_marks = sum(marks_list)/total_students
highest_marks = max(marks_list)
lowest_marks = min(marks_list)
#Grade distribution counting
grade_counts = {'A':0, 'B':0, 'C':0, 'D':0, 'E':0, 'F':0}

for marks in marks_list:
    if marks >= 90:
        grade_counts['A'] += 1
    elif marks >= 80:
        grade_counts['B'] += 1
    elif marks >= 70:
        grade_counts['C'] += 1
    elif marks >= 60:
        grade_counts['D'] += 1
    elif marks >= 50:
        grade_counts['E'] += 1
    else:
        grade_counts['F'] += 1

print(f"Total students: {total_students}")
print(f"Average Marks: {average_marks:.2f}")
print(f"Highest Marks: {highest_marks}")
print(f"Lowest Marks: {lowest_marks}")

print("Grade Distribution:")
for grade, count in grade_counts.items():
    print(f"{grade}: {count}students")