import { render, screen, fireEvent, act } from '@testing-library/react';
import CourseList from './CourseList';
import api from '../config/api';

// Mock the api module
jest.mock('../config/api', () => ({
    __esModule: true,
    default: {
        get: jest.fn()
    }
}));

describe('CourseList Component', () => {
    const mockCourses = [
        {
            id: 1,
            name: 'Mathematics',
            ects: 6,
            semester: 1,
            room_number: 'A123',
            teacher_id: 1
        },
        {
            id: 2,
            name: 'Physics',
            ects: 5,
            semester: 1,
            room_number: 'B456',
            teacher_id: 2
        }
    ];

    beforeEach(async () => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        // Mock the API response
        (api.get as jest.Mock).mockResolvedValue({ data: mockCourses });

        // Wrap the render in act
        await act(async () => {
            render(<CourseList />);
        });
    });

    test('renders course list', async () => {
        expect(screen.getByText('Course List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Courses')).toBeInTheDocument();

        // Wait for courses to be loaded
        const mathCourse = await screen.findByText('Mathematics');
        const physicsCourse = await screen.findByText('Physics');

        expect(mathCourse).toBeInTheDocument();
        expect(physicsCourse).toBeInTheDocument();
    });

    test('filters courses based on search input', async () => {
        // Wait for courses to be loaded
        await screen.findByText('Mathematics');

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Search Courses'), { target: { value: 'Math' } });
        });

        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.queryByText('Physics')).not.toBeInTheDocument();
    });
});