from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# Define the Student model
class Student(BaseModel):
    student_id: int
    student: str

# Define a model for multiple students
class StudentList(BaseModel):
    students: List[Student]

app = FastAPI()

students: List[Student] = []

@app.get("/students", response_model=List[Student])
def get_students():
    return students

@app.post('/students', response_model=Student)
def create_student(student: Student):
    students.append(student)
    return student

# Endpoint for adding multiple students as a list
@app.post('/students/bulk', response_model=List[Student])
def create_students_bulk(new_students: List[Student]):
    for student in new_students:
        students.append(student)
    return new_students

# Alternative endpoint using a wrapper model
@app.post('/students/multiple', response_model=StudentList)
def create_students_multiple(student_list: StudentList):
    for student in student_list.students:
        students.append(student)
    return student_list

@app.get('/students/{student_id}', response_model=Student)
def get_student(student_id: int):
    try:
        return next(s for s in students if s.student_id == student_id)
    except StopIteration:
        raise HTTPException(status_code=404, detail="Student not found")

@app.delete('/students/{student_id}')
def delete_student(student_id: int):
    try:
        student = next(s for s in students if s.student_id == student_id)
        students.remove(student)
        return {"message": f"Student {student_id} deleted successfully"}
    except StopIteration:
        raise HTTPException(status_code=404, detail="Student not found")






