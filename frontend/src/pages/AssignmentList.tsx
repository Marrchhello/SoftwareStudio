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
import { Assignment } from '../types/api';

const AssignmentList: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data } = await api.get<Assignment[]>('/api/v1/assignments');
                setAssignments(data as Assignment[]);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'An error occurred while fetching assignments');
            }
        };

        fetchAssignments();
    }, []);

    const filteredAssignments = assignments.filter((assignment: Assignment) =>
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Assignment List
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Search Assignments"
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
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAssignments.map((assignment: Assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell>{assignment.type}</TableCell>
                                    <TableCell>{assignment.description}</TableCell>
                                    <TableCell>{new Date(assignment.due_date).toLocaleDateString()}</TableCell>
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

export default AssignmentList; 