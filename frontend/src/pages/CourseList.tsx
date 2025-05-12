import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Box,
} from '@mui/material';
import api from '../config/api';
import { Course } from '../types/api';

const CourseList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/api/v1/courses');
                const courseData = response.data as Course[];
                setCourses(courseData);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'An error occurred while fetching courses');
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = courses.filter((course: Course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.room_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Course List
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Search Courses"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                </Box>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Course Name</TableCell>
                                <TableCell>ECTS</TableCell>
                                <TableCell>Semester</TableCell>
                                <TableCell>Room</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCourses.map((course: Course) => (
                                <TableRow key={course.id}>
                                    <TableCell>{course.name}</TableCell>
                                    <TableCell>{course.ects}</TableCell>
                                    <TableCell>{course.semester}</TableCell>
                                    <TableCell>{course.room_number}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => {/* Handle view details */ }}
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default CourseList; 