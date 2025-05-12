import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseList from './pages/CourseList';
import AssignmentList from './pages/AssignmentList';
import GradeList from './pages/GradeList';
import Layout from './components/Layout';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/login" replace />} />
                    <Route path="student" element={<StudentDashboard />} />
                    <Route path="teacher" element={<TeacherDashboard />} />
                    <Route path="courses" element={<CourseList />} />
                    <Route path="assignments" element={<AssignmentList />} />
                    <Route path="grades" element={<GradeList />} />
                </Route>
            </Routes>
        </ThemeProvider>
    );
}

export default App; 