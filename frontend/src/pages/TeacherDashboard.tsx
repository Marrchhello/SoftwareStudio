import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface Course {
    id: number;
    name: string;
    ects: number;
    semester: number;
    room_number: string;
}

interface Assignment {
    id: number;
    course_id: number;
    due_date: string;
    type: string;
    description: string;
}

const TeacherDashboard: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch courses
                const coursesResponse = await axios.get('http://localhost:8000/api/v1/courses', { headers });
                setCourses(coursesResponse.data);

                // Fetch assignments
                const assignmentsResponse = await axios.get('http://localhost:8000/api/v1/assignments', { headers });
                setAssignments(assignmentsResponse.data);
            } catch (err: any) {
                console.error('An error occurred while fetching data:', err.response?.data?.detail || 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateAssignment = (courseId: number) => {
        // Navigate to assignment creation page or open modal
        console.log('Create assignment for course:', courseId);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {loading ? (
                <Grid container justifyContent="center">
                    <CircularProgress />
                </Grid>
            ) : (
                <Grid container spacing={3}>
                    {/* Courses Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                My Courses
                            </Typography>
                            <List>
                                {courses.map((course) => (
                                    <React.Fragment key={course.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={course.name}
                                                secondary={`ECTS: ${course.ects} | Semester: ${course.semester} | Room: ${course.room_number}`}
                                            />
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleCreateAssignment(course.id)}
                                            >
                                                Add Assignment
                                            </Button>
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Assignments Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                                Recent Assignments
                            </Typography>
                            <List>
                                {assignments.map((assignment) => (
                                    <React.Fragment key={assignment.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={assignment.description}
                                                secondary={`Due: ${new Date(assignment.due_date).toLocaleDateString()} | Type: ${assignment.type}`}
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default TeacherDashboard; 