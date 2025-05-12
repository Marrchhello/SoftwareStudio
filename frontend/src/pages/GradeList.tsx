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
    TextField,
    Box,
} from '@mui/material';
import api from '../config/api';
import { Grade, Assignment } from '../types/api';

const GradeList: React.FC = () => {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [assignments, setAssignments] = useState<{ [key: number]: Assignment }>({});
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch grades
                const { data: gradesData } = await api.get<Grade[]>('/api/v1/grades');
                setGrades(gradesData as Grade[]);

                // Fetch assignments
                const { data: assignmentsData } = await api.get<Assignment[]>('/api/v1/assignments');
                const assignmentsMap = (assignmentsData as Assignment[]).reduce((acc: { [key: number]: Assignment }, assignment: Assignment) => {
                    acc[assignment.id] = assignment;
                    return acc;
                }, {});
                setAssignments(assignmentsMap);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'An error occurred while fetching data');
            }
        };

        fetchData();
    }, []);

    const filteredGrades = grades.filter((grade: Grade) => {
        const assignment = assignments[grade.assignment_id];
        return assignment && (
            assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Grade List
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Search Grades"
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
                                <TableCell>Assignment</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Submission Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredGrades.map((grade: Grade) => {
                                const assignment = assignments[grade.assignment_id];
                                return (
                                    <TableRow key={`${grade.student_id}-${grade.assignment_id}`}>
                                        <TableCell>{assignment?.description || 'Unknown'}</TableCell>
                                        <TableCell>{assignment?.type || 'Unknown'}</TableCell>
                                        <TableCell>{grade.grade}</TableCell>
                                        <TableCell>{new Date(grade.submitted_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default GradeList; 