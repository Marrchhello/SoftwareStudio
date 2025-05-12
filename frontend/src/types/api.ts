export interface Course {
    id: number;
    name: string;
    ects: number;
    semester: number;
    room_number: string;
    teacher_id: number;
}

export interface Assignment {
    id: number;
    course_id: number;
    due_date: string;
    type: string;
    description: string;
}

export interface Grade {
    student_id: number;
    assignment_id: number;
    grade: number;
    submitted_at: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
} 