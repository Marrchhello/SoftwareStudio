--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: roles; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.roles AS ENUM (
    'STUDENT',
    'TEACHER',
    'STAFF'
);


ALTER TYPE public.roles OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Assignment" (
    "assignmentId" integer NOT NULL,
    name character varying NOT NULL,
    "desc" character varying,
    "dueDateTime" timestamp without time zone,
    "needsSubmission" boolean NOT NULL,
    "validFileTypes" character varying,
    "group" integer,
    "courseId" integer NOT NULL
);


ALTER TABLE public."Assignment" OWNER TO postgres;

--
-- Name: AssignmentSubmission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AssignmentSubmission" (
    "assignmentSubmissionId" integer NOT NULL,
    "assignmentId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "submissionDateTime" timestamp without time zone NOT NULL,
    submission character varying
);


ALTER TABLE public."AssignmentSubmission" OWNER TO postgres;

--
-- Name: AssignmentSubmission_assignmentSubmissionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AssignmentSubmission_assignmentSubmissionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AssignmentSubmission_assignmentSubmissionId_seq" OWNER TO postgres;

--
-- Name: AssignmentSubmission_assignmentSubmissionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AssignmentSubmission_assignmentSubmissionId_seq" OWNED BY public."AssignmentSubmission"."assignmentSubmissionId";


--
-- Name: Assignment_assignmentId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Assignment_assignmentId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Assignment_assignmentId_seq" OWNER TO postgres;

--
-- Name: Assignment_assignmentId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Assignment_assignmentId_seq" OWNED BY public."Assignment"."assignmentId";


--
-- Name: Chat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Chat" (
    "chatId" integer NOT NULL,
    "user1Id" integer NOT NULL,
    "user2Id" integer NOT NULL
);


ALTER TABLE public."Chat" OWNER TO postgres;

--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatMessage" (
    "chatMessageId" integer NOT NULL,
    "chatId" integer NOT NULL,
    "senderId" integer NOT NULL,
    message character varying NOT NULL,
    "timestamp" timestamp without time zone NOT NULL
);


ALTER TABLE public."ChatMessage" OWNER TO postgres;

--
-- Name: ChatMessage_chatMessageId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChatMessage_chatMessageId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatMessage_chatMessageId_seq" OWNER TO postgres;

--
-- Name: ChatMessage_chatMessageId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChatMessage_chatMessageId_seq" OWNED BY public."ChatMessage"."chatMessageId";


--
-- Name: Chat_chatId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Chat_chatId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Chat_chatId_seq" OWNER TO postgres;

--
-- Name: Chat_chatId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Chat_chatId_seq" OWNED BY public."Chat"."chatId";


--
-- Name: ClassDateTime; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClassDateTime" (
    "classDateTimeId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "dateStartTime" timestamp without time zone NOT NULL,
    "endTime" time without time zone NOT NULL
);


ALTER TABLE public."ClassDateTime" OWNER TO postgres;

--
-- Name: ClassDateTime_classDateTimeId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ClassDateTime_classDateTimeId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ClassDateTime_classDateTimeId_seq" OWNER TO postgres;

--
-- Name: ClassDateTime_classDateTimeId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ClassDateTime_classDateTimeId_seq" OWNED BY public."ClassDateTime"."classDateTimeId";


--
-- Name: CourseCatalog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseCatalog" (
    "courseId" integer NOT NULL,
    "courseName" character varying NOT NULL,
    semester integer NOT NULL,
    ects integer NOT NULL,
    "isBiWeekly" boolean NOT NULL
);


ALTER TABLE public."CourseCatalog" OWNER TO postgres;

--
-- Name: CourseCatalog_courseId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CourseCatalog_courseId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CourseCatalog_courseId_seq" OWNER TO postgres;

--
-- Name: CourseCatalog_courseId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CourseCatalog_courseId_seq" OWNED BY public."CourseCatalog"."courseId";


--
-- Name: CourseStudent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseStudent" (
    "courseStudentId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "group" integer
);


ALTER TABLE public."CourseStudent" OWNER TO postgres;

--
-- Name: CourseStudent_courseStudentId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CourseStudent_courseStudentId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CourseStudent_courseStudentId_seq" OWNER TO postgres;

--
-- Name: CourseStudent_courseStudentId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CourseStudent_courseStudentId_seq" OWNED BY public."CourseStudent"."courseStudentId";


--
-- Name: CourseTeacher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CourseTeacher" (
    "courseTeacherId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "teacherId" integer
);


ALTER TABLE public."CourseTeacher" OWNER TO postgres;

--
-- Name: CourseTeacher_courseTeacherId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CourseTeacher_courseTeacherId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CourseTeacher_courseTeacherId_seq" OWNER TO postgres;

--
-- Name: CourseTeacher_courseTeacherId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CourseTeacher_courseTeacherId_seq" OWNED BY public."CourseTeacher"."courseTeacherId";


--
-- Name: Degree; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Degree" (
    "degreeId" integer NOT NULL,
    name character varying,
    "numSemesters" integer NOT NULL
);


ALTER TABLE public."Degree" OWNER TO postgres;

--
-- Name: Degree_degreeId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Degree_degreeId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Degree_degreeId_seq" OWNER TO postgres;

--
-- Name: Degree_degreeId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Degree_degreeId_seq" OWNED BY public."Degree"."degreeId";


--
-- Name: FAQ; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FAQ" (
    "faqId" integer NOT NULL,
    question character varying NOT NULL,
    answer character varying NOT NULL
);


ALTER TABLE public."FAQ" OWNER TO postgres;

--
-- Name: FAQ_faqId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."FAQ_faqId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FAQ_faqId_seq" OWNER TO postgres;

--
-- Name: FAQ_faqId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."FAQ_faqId_seq" OWNED BY public."FAQ"."faqId";


--
-- Name: Grade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Grade" (
    "gradeId" integer NOT NULL,
    "studentId" integer NOT NULL,
    grade double precision,
    "assignmentId" integer NOT NULL
);


ALTER TABLE public."Grade" OWNER TO postgres;

--
-- Name: Grade_gradeId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Grade_gradeId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Grade_gradeId_seq" OWNER TO postgres;

--
-- Name: Grade_gradeId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Grade_gradeId_seq" OWNED BY public."Grade"."gradeId";


--
-- Name: Room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Room" (
    "roomId" integer NOT NULL,
    "courseId" integer NOT NULL,
    building character varying,
    "roomNumber" integer
);


ALTER TABLE public."Room" OWNER TO postgres;

--
-- Name: Room_roomId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Room_roomId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Room_roomId_seq" OWNER TO postgres;

--
-- Name: Room_roomId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Room_roomId_seq" OWNED BY public."Room"."roomId";


--
-- Name: Staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Staff" (
    "staffId" integer NOT NULL,
    name character varying NOT NULL,
    email character varying,
    administrator boolean NOT NULL
);


ALTER TABLE public."Staff" OWNER TO postgres;

--
-- Name: Staff_staffId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Staff_staffId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Staff_staffId_seq" OWNER TO postgres;

--
-- Name: Staff_staffId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Staff_staffId_seq" OWNED BY public."Staff"."staffId";


--
-- Name: Student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Student" (
    "studentId" integer NOT NULL,
    semester integer NOT NULL,
    "degreeId" integer NOT NULL,
    name character varying,
    age integer,
    email character varying
);


ALTER TABLE public."Student" OWNER TO postgres;

--
-- Name: Student_studentId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Student_studentId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Student_studentId_seq" OWNER TO postgres;

--
-- Name: Student_studentId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Student_studentId_seq" OWNED BY public."Student"."studentId";


--
-- Name: Teacher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Teacher" (
    "teacherId" integer NOT NULL,
    name character varying,
    title character varying,
    email character varying
);


ALTER TABLE public."Teacher" OWNER TO postgres;

--
-- Name: Teacher_teacherId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Teacher_teacherId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Teacher_teacherId_seq" OWNER TO postgres;

--
-- Name: Teacher_teacherId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Teacher_teacherId_seq" OWNED BY public."Teacher"."teacherId";


--
-- Name: UniversityEvents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UniversityEvents" (
    "eventId" integer NOT NULL,
    "eventName" character varying NOT NULL,
    "dateStartTime" timestamp without time zone NOT NULL,
    "dateEndTime" timestamp without time zone NOT NULL,
    "isHoliday" boolean NOT NULL
);


ALTER TABLE public."UniversityEvents" OWNER TO postgres;

--
-- Name: UniversityEvents_eventId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UniversityEvents_eventId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UniversityEvents_eventId_seq" OWNER TO postgres;

--
-- Name: UniversityEvents_eventId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UniversityEvents_eventId_seq" OWNED BY public."UniversityEvents"."eventId";


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    "userId" integer NOT NULL,
    username character varying(16) NOT NULL,
    password bytea NOT NULL,
    role public.roles NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_userId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_userId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_userId_seq" OWNER TO postgres;

--
-- Name: User_userId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_userId_seq" OWNED BY public."User"."userId";


--
-- Name: Assignment assignmentId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment" ALTER COLUMN "assignmentId" SET DEFAULT nextval('public."Assignment_assignmentId_seq"'::regclass);


--
-- Name: AssignmentSubmission assignmentSubmissionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentSubmission" ALTER COLUMN "assignmentSubmissionId" SET DEFAULT nextval('public."AssignmentSubmission_assignmentSubmissionId_seq"'::regclass);


--
-- Name: Chat chatId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chat" ALTER COLUMN "chatId" SET DEFAULT nextval('public."Chat_chatId_seq"'::regclass);


--
-- Name: ChatMessage chatMessageId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage" ALTER COLUMN "chatMessageId" SET DEFAULT nextval('public."ChatMessage_chatMessageId_seq"'::regclass);


--
-- Name: ClassDateTime classDateTimeId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClassDateTime" ALTER COLUMN "classDateTimeId" SET DEFAULT nextval('public."ClassDateTime_classDateTimeId_seq"'::regclass);


--
-- Name: CourseCatalog courseId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseCatalog" ALTER COLUMN "courseId" SET DEFAULT nextval('public."CourseCatalog_courseId_seq"'::regclass);


--
-- Name: CourseStudent courseStudentId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseStudent" ALTER COLUMN "courseStudentId" SET DEFAULT nextval('public."CourseStudent_courseStudentId_seq"'::regclass);


--
-- Name: CourseTeacher courseTeacherId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseTeacher" ALTER COLUMN "courseTeacherId" SET DEFAULT nextval('public."CourseTeacher_courseTeacherId_seq"'::regclass);


--
-- Name: Degree degreeId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Degree" ALTER COLUMN "degreeId" SET DEFAULT nextval('public."Degree_degreeId_seq"'::regclass);


--
-- Name: FAQ faqId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FAQ" ALTER COLUMN "faqId" SET DEFAULT nextval('public."FAQ_faqId_seq"'::regclass);


--
-- Name: Grade gradeId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade" ALTER COLUMN "gradeId" SET DEFAULT nextval('public."Grade_gradeId_seq"'::regclass);


--
-- Name: Room roomId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room" ALTER COLUMN "roomId" SET DEFAULT nextval('public."Room_roomId_seq"'::regclass);


--
-- Name: Staff staffId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staff" ALTER COLUMN "staffId" SET DEFAULT nextval('public."Staff_staffId_seq"'::regclass);


--
-- Name: Student studentId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student" ALTER COLUMN "studentId" SET DEFAULT nextval('public."Student_studentId_seq"'::regclass);


--
-- Name: Teacher teacherId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teacher" ALTER COLUMN "teacherId" SET DEFAULT nextval('public."Teacher_teacherId_seq"'::regclass);


--
-- Name: UniversityEvents eventId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UniversityEvents" ALTER COLUMN "eventId" SET DEFAULT nextval('public."UniversityEvents_eventId_seq"'::regclass);


--
-- Name: User userId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN "userId" SET DEFAULT nextval('public."User_userId_seq"'::regclass);

--
-- Name: AssignmentSubmission_assignmentSubmissionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AssignmentSubmission_assignmentSubmissionId_seq"', 1, false);


--
-- Name: Assignment_assignmentId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Assignment_assignmentId_seq"', 1, false);


--
-- Name: ChatMessage_chatMessageId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChatMessage_chatMessageId_seq"', 1, false);


--
-- Name: Chat_chatId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Chat_chatId_seq"', 1, false);


--
-- Name: ClassDateTime_classDateTimeId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ClassDateTime_classDateTimeId_seq"', 1, false);


--
-- Name: CourseCatalog_courseId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CourseCatalog_courseId_seq"', 1, false);


--
-- Name: CourseStudent_courseStudentId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CourseStudent_courseStudentId_seq"', 1, false);


--
-- Name: CourseTeacher_courseTeacherId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CourseTeacher_courseTeacherId_seq"', 1, false);


--
-- Name: Degree_degreeId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Degree_degreeId_seq"', 1, false);


--
-- Name: FAQ_faqId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FAQ_faqId_seq"', 1, false);


--
-- Name: Grade_gradeId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Grade_gradeId_seq"', 1, false);


--
-- Name: Room_roomId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Room_roomId_seq"', 1, false);


--
-- Name: Staff_staffId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Staff_staffId_seq"', 1, false);


--
-- Name: Student_studentId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Student_studentId_seq"', 1, false);


--
-- Name: Teacher_teacherId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Teacher_teacherId_seq"', 1, false);


--
-- Name: UniversityEvents_eventId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UniversityEvents_eventId_seq"', 1, false);


--
-- Name: User_userId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_userId_seq"', 1, false);


--
-- Name: AssignmentSubmission AssignmentSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentSubmission"
    ADD CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("assignmentSubmissionId");


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignmentId");


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("chatMessageId");


--
-- Name: Chat Chat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("chatId");


--
-- Name: ClassDateTime ClassDateTime_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClassDateTime"
    ADD CONSTRAINT "ClassDateTime_pkey" PRIMARY KEY ("classDateTimeId");


--
-- Name: CourseCatalog CourseCatalog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseCatalog"
    ADD CONSTRAINT "CourseCatalog_pkey" PRIMARY KEY ("courseId");


--
-- Name: CourseStudent CourseStudent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseStudent"
    ADD CONSTRAINT "CourseStudent_pkey" PRIMARY KEY ("courseStudentId");


--
-- Name: CourseTeacher CourseTeacher_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseTeacher"
    ADD CONSTRAINT "CourseTeacher_pkey" PRIMARY KEY ("courseTeacherId");


--
-- Name: Degree Degree_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Degree"
    ADD CONSTRAINT "Degree_pkey" PRIMARY KEY ("degreeId");


--
-- Name: FAQ FAQ_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FAQ"
    ADD CONSTRAINT "FAQ_pkey" PRIMARY KEY ("faqId");


--
-- Name: Grade Grade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_pkey" PRIMARY KEY ("gradeId");


--
-- Name: Room Room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("roomId");


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY ("staffId");


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId");


--
-- Name: Teacher Teacher_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_pkey" PRIMARY KEY ("teacherId");


--
-- Name: UniversityEvents UniversityEvents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UniversityEvents"
    ADD CONSTRAINT "UniversityEvents_pkey" PRIMARY KEY ("eventId");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");


--
-- Name: AssignmentSubmission AssignmentSubmission_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentSubmission"
    ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"("assignmentId");


--
-- Name: AssignmentSubmission AssignmentSubmission_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AssignmentSubmission"
    ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"("studentId");


--
-- Name: Assignment Assignment_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."CourseCatalog"("courseId");


--
-- Name: ChatMessage ChatMessage_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public."Chat"("chatId");


--
-- Name: ChatMessage ChatMessage_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"("userId");


--
-- Name: Chat Chat_user1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES public."User"("userId");


--
-- Name: Chat Chat_user2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES public."User"("userId");


--
-- Name: ClassDateTime ClassDateTime_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClassDateTime"
    ADD CONSTRAINT "ClassDateTime_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."CourseCatalog"("courseId");


--
-- Name: CourseStudent CourseStudent_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseStudent"
    ADD CONSTRAINT "CourseStudent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."CourseCatalog"("courseId");


--
-- Name: CourseStudent CourseStudent_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseStudent"
    ADD CONSTRAINT "CourseStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"("studentId");


--
-- Name: CourseTeacher CourseTeacher_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseTeacher"
    ADD CONSTRAINT "CourseTeacher_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."CourseCatalog"("courseId");


--
-- Name: CourseTeacher CourseTeacher_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CourseTeacher"
    ADD CONSTRAINT "CourseTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"("teacherId");


--
-- Name: Grade Grade_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public."Assignment"("assignmentId");


--
-- Name: Grade Grade_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Grade"
    ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"("studentId");


--
-- Name: Room Room_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."CourseCatalog"("courseId");


--
-- Name: Student Student_degreeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES public."Degree"("degreeId");


--
-- PostgreSQL database dump complete
--

--
-- Default data
--

-- Course Catalog
insert into public."CourseCatalog" ("courseName", semester, ects, "isBiWeekly") values 
('Databases 2', 4, 5, true), 
('Computer Networks', 4, 5, false),
('Software Engineering', 4, 5, true),
('Software Studio', 4, 3, false),
('Databases 1', 3, 6, false);

-- Degree
insert into public."Degree" (name, "numSemesters") values
('Computer Science', 7),
('Ceramics', 4),
('English', 8);

-- FAQ
insert into public."FAQ" (question, answer) values
('How do I create an account?', 'After a staff member adds you to the system, you can use your Student/Teacher ID in the register page to create an account.'),
('How do I see my schedule?', 'Once you are logged in, there is a Schedule tab which has your classes and school events. If you are a student, you will also see assignments.'),
('How can I chat with my teachers/classmates?', 'Ask them for their Student/Teacher ID and then you can start a chat in the chat tab.'),
('Where can I find the map?', 'In the homepage, there is a button called Map. This will take you to the map. Also, any class that has an assigned room will redirect you to the map.'),
('What if I am not in the system?', 'Please contact a staff memeber and they will help you out.'),
('What makes UPSOS unqiue?', 'This combines UPEL and USOS. When you are assigned to a course, the course will automatically appear for you. You can see your grades, schedule, chats, etc all from your student page.'),
('Can I grade my asignments using a 2.0-5.0 scale?', 'Of course! In UPSOS, you can grade using either a percent score, or a 2.0-5.0 scale.');

-- Staff
insert into public."Staff" (name, email, administrator) values
('Bartosz Wolek', 'bwolek@student.agh.edu.pl', true),
('Markiian Voloshyn', 'markiian@voloshyn.gov', false),
('Szymon Was', 'szymon@was.com', true),
('Qingyang Zhu', 'qingyang@zhu.edu', false);

-- Teacher
insert into public."Teacher" (name, title, email) values
('Patrick Star', 'Dr. Prof.', 'patrick.star@upsos.edu'),
('Spongebob Squarepants', 'Prof', 'sponge.bob@agh.edu'),
('Squidward Tentacles', 'Mr.', 'i.wanna.quit@krusty.krab'),
('Sandy Cheeks', 'Dr.', 'sandy.cheeks@upsos.edu');

-- University Events
insert into public."UniversityEvents" ("eventName", "dateStartTime", "dateEndTime", "isHoliday") values
('Dog Day', '2025-06-26 00:00:00', '2025-06-26 23:59:59', true),
('Hot dogs in front of B4', '2025-06-26 10:00:00', '2025-06-26 11:30:00', false),
('Cat Day', '2025-06-27 00:00:00', '2025-06-27 23:59:59', false);

-- Assignment
insert into public."Assignment" (name, "desc", "dueDateTime", "needsSubmission", "validFileTypes", "group", "courseId") values
('PostGres', 'Create an example db in postgres.', '2025-06-23 10:00:00', true, 'txt', 1, 1),
('MySQL', 'Create an example db in mysql.', '2025-06-23 11:00:00', false, null, 1, 1),
('SurrealDB', 'Create an example db in surrealdb.', null, false, null, 2, 1),
('NAT', 'Set up a nat.', '2025-06-25 09:00:00', true, 'txt', 1, 2),
('WIFI', 'Connect to the wifi.', '2025-06-26 10:00:00', false, null, 2, 2),
('Routers', 'Setup dynamic routing.', '2025-06-26 09:00:00', false, null, 1, 2),
('GIT', 'Create a demo repo.', '2025-06-26 08:00:00', true, 'link', 1, 3),
('World Machine Model', 'Create your WMM.', null, false, null, 1, 3),
('Checkpoint 1', 'Show your progress.', '2025-06-27 10:00:00', true, 'txt, link', 2, 4),
('Checkpoint 2', 'Present your project.', '2025-06-27 09:00:00', false, null, 2, 4),
('DB Tables', 'Make some sample tables.', '2025-06-25 08:00:00', true, 'txt', 1, 5),
('Keys', 'Show how to create keys for your tables.', '2025-06-24 07:00:00', true, 'txt', 2, 5);

-- Class Date Time
insert into public."ClassDateTime" ("courseId", "dateStartTime", "endTime") values
(1, '2025-06-23 10:00:00', '11:30:00'),
(1, '2025-06-24 10:00:00', '11:30:00'),
(2, '2025-06-24 11:45:00', '13:15:00'),
(3, '2025-06-25 15:00:00', '16:30:00'),
(4, '2025-06-24 16:45:00', '18:15:00'),
(4, '2025-06-26 14:00:00', '15:30:00'),
(5, '2025-06-27 13:00:00', '13:45:00'),
(1, '2025-06-26 10:00:00', '10:45:00');

-- Course Teacher
insert into public."CourseTeacher" ("courseId", "teacherId") values
(1,1),
(2,2),
(3,3),
(4,4),
(5,1);

-- Room
insert into public."Room" ("courseId", building, "roomNumber") values
(1, 'C2', 208),
(2, 'C2', 313),
(3, 'C2', 315),
(4, 'B5', 210),
(5, 'B5', 402);

-- Student
insert into public."Student" (semester, "degreeId", name, age, email) values
(4, 1, 'Rick Astley', 21, 'rick@astley.com'),
(4, 2, 'Timmy Turner', 21, 'timmy@turner.com'),
(4, 3, 'Robyn Banks', 21, 'robyn@banks.com'),
(3, 1, 'Walter White', 21, 'walter@white.com');

-- User
INSERT INTO public."User" (username, "password", "role", "roleId") VALUES('Patrick', decode('24326224313224427679495242647749796E335179676A323366493075682F624A67384935664A673835724F7A4E6C53684F6A534446373077585A6D','hex'), 'TEACHER'::public."roles", 1);
INSERT INTO public."User" (username, "password", "role", "roleId") VALUES('Spongebob', decode('24326224313224722E4743573346386335487477684D433270666D704F6C737452372E477A51746845385A766F377635366745526A53796754633969','hex'), 'TEACHER'::public."roles", 2);
INSERT INTO public."User" (username, "password", "role", "roleId") VALUES('Squidward', decode('24326224313224534E63442F69673769546859344A7442666138346B4F746D7577653675486E7857753671666E6C354A52616E70562F4A4D6666534B','hex'), 'TEACHER'::public."roles", 3);
INSERT INTO public."User" (username, "password", "role", "roleId") VALUES('Sandy', decode('2432622431322465414F6F4558626E7558544D737A5A4D6A5A4C53754F77684B2F6D7A68753333632F42547639463655735230757377736168392F36','hex'), 'TEACHER'::public."roles", 4);
INSERT INTO public."User" (username, "password", "role", "roleId") VALUES('Rick', decode('2432622431322446617A4B30343935415A48412E5144466F4C7349692E7067366A39483861773738764650314C544D6B68335533674F723274455247','hex'), 'STUDENT'::public."roles", 1);
INSERT INTO public."User" (username, "password", "role", "roleId") VALUES('Timmy', decode('243262243132245374596D6E62734A34674D72596262382E662E54624F317356742F6E4E542E5768704372494F507873724C34746546556C65495A61','hex'), 'STUDENT'::public."roles", 2);
INSERT INTO public."User" (username, "password", "role", "roleId") VALUES('Robyn', decode('24326224313224726E483439354E4D7171396A386E7657304A574133753036776E64656E624E46554B2F4859554C552E7476617253596B7550494B71','hex'), 'STUDENT'::public."roles", 3);

-- Course Student
insert into public."CourseStudent" ("courseId", "studentId", "group") values
(1, 1, 1),
(1, 2, 2),
(1, 3, 1),
(2, 1, 1),
(2, 2, 2),
(2, 3, 3),
(3, 1, 2),
(3, 2, 1),
(4, 3, 2),
(4, 2, 2),
(5, 1, 1),
(5, 4, 2),
(5, 3, 2),
(5, 2, 1);

-- Assignment submission
insert into public."AssignmentSubmission" ("assignmentId", "studentId", "submissionDateTime", submission) values
(1, 1, '2025-06-22 10:00:00', 'Example submission'),
(4, 1, '2025-06-21 11:00:00', 'Example submission 2'),
(3, 2, '2025-06-22 12:00:00', 'Example submission 3'),
(7, 2, '2025-06-20 11:00:00', 'Example submission 4'),
(9, 3, '2025-06-21 10:00:00', 'Example submission 5'),
(12, 4, '2025-06-20 9:00:00', 'Example submission 6');

-- Chat
insert into public."Chat" ("user1Id", "user2Id") values
(1, 2),
(2, 3), 
(3, 4),
(4, 5),
(5, 6),
(6, 7),
(7, 1),
(1, 3),
(2, 4),
(5, 7);

-- Chat Message
INSERT INTO public."ChatMessage" ("chatId", "senderId", message, "timestamp") VALUES(1, 1, 'Bananas are good.', '2025-06-22 15:42:53.326');
INSERT INTO public."ChatMessage" ("chatId", "senderId", message, "timestamp") VALUES(1, 1, 'Bananas are great!', '2025-06-22 15:46:14.395');
INSERT INTO public."ChatMessage" ("chatId", "senderId", message, "timestamp") VALUES(4, 5, 'Hello World', '2025-06-22 15:48:38.040');
INSERT INTO public."ChatMessage" ("chatId", "senderId", message, "timestamp") VALUES(4, 5, 'test', '2025-06-22 15:56:37.091');
INSERT INTO public."ChatMessage" ("chatId", "senderId", message, "timestamp") VALUES(4, 4, 'Hello', '2025-06-22 16:11:10.782');

-- Grade
insert into public."Grade" ("studentId", grade, "assignmentId") values
(1, 100, 1),
(2, 95, 3),
(2, 50, 7),
(3, 75, 9);