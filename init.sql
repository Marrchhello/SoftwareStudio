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
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Assignment" ("assignmentId", name, "desc", "dueDateTime", "needsSubmission", "validFileTypes", "group", "courseId") FROM stdin;
0	Hello World	\N	\N	t	\N	\N	0
1	Goodbye World	Make Hello World in Assembly	2025-06-25 06:36:00	t	txt	1	1
2	a	\N	\N	t	\N	\N	0
3	b	\N	2025-06-25 08:36:00	f	\N	\N	0
4	c	\N	2025-06-24 06:36:00	f	\N	\N	1
5	f	\N	2025-06-23 06:36:00	f	\N	\N	1
6	e	\N	2025-06-25 10:36:00	t	\N	\N	2
7	d	\N	2025-06-22 06:36:00	f	\N	\N	2
8	g	\N	2025-06-25 06:36:00	t	\N	\N	3
9	h	\N	\N	t	\N	\N	3
\.


--
-- Data for Name: AssignmentSubmission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AssignmentSubmission" ("assignmentSubmissionId", "assignmentId", "studentId", "submissionDateTime", submission) FROM stdin;
0	0	1	2025-06-25 06:36:00	Hello World
1	2	1	2025-06-26 07:36:00	Goodbye World
2	4	1	2025-06-27 08:36:00	\N
3	6	1	2025-06-28 09:36:00	Im Still Here World
4	8	1	2025-06-28 09:36:00	\N
\.


--
-- Data for Name: ClassDateTime; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClassDateTime" ("classDateTimeId", "courseId", "dateStartTime", "endTime") FROM stdin;
0	0	2025-12-20 10:00:00	11:30:00
1	0	2025-12-25 09:36:00	11:30:00
2	1	2025-05-09 09:51:00	14:45:00
3	2	2025-12-25 10:36:00	13:30:00
4	2	2025-11-25 10:00:00	11:30:00
5	3	2025-12-25 12:36:00	15:30:00
6	3	2025-10-25 10:00:00	11:30:00
7	1	2025-09-25 08:36:00	11:30:00
8	1	2025-07-25 10:00:00	11:30:00
9	1	2025-07-25 10:36:00	13:30:00
10	2	2025-06-25 10:00:00	11:30:00
11	2	2025-05-25 08:36:00	11:30:00
12	3	2025-05-25 15:00:00	16:30:00
13	3	2025-05-25 08:36:00	11:30:00
\.


--
-- Data for Name: CourseCatalog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseCatalog" ("courseId", "courseName", semester, ects, "isBiWeekly") FROM stdin;
0	Prog	1	1	t
1	Optimization	4	5	f
2	Engrish	3	3	t
3	Javanese	2	4	f
\.


--
-- Data for Name: CourseStudent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseStudent" ("courseStudentId", "courseId", "studentId", "group") FROM stdin;
0	0	0	\N
1	1	1	1
\.


--
-- Data for Name: CourseTeacher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CourseTeacher" ("courseTeacherId", "courseId", "teacherId") FROM stdin;
0	0	\N
1	1	1
2	2	1
\.


--
-- Data for Name: Degree; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Degree" ("degreeId", name, "numSemesters") FROM stdin;
0	\N	7
1	Computer Science	7
\.


--
-- Data for Name: FAQ; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FAQ" ("faqId", question, answer) FROM stdin;
1	What did the tomato say to the other tomato during a race?	Ketchup.
2	What do you call a priest that becomes a lawyer?	A father-in-law.
3	What runs but never goes anywhere?	A fridge.
4	Why do seagulls fly over the sea?	If they flew over the bay, they would be bagels.
5	Why are snails slow?	Because they're carrying a house on their back.
6	How does the ocean say hi?	It waves!
\.


--
-- Data for Name: Grade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Grade" ("gradeId", "studentId", grade, "assignmentId") FROM stdin;
0	0	\N	0
1	1	87.5	1
2	1	65	2
3	1	73.2	3
4	1	99.9	4
5	1	100	5
6	1	\N	6
7	1	0	7
8	1	97	8
9	1	105	9
10	1	-10	0
11	0	66.7	1
\.


--
-- Data for Name: Room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Room" ("roomId", "courseId", building, "roomNumber") FROM stdin;
0	0	\N	\N
1	1	B5	405
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Staff" ("staffId", name, email, administrator) FROM stdin;
0	ben	\N	f
1	larry	creative@email.com	t
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Student" ("studentId", semester, "degreeId", name, age, email) FROM stdin;
0	1	0	\N	\N	\N
1	4	1	ben	22	roll@rick.lel
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Teacher" ("teacherId", name, title, email) FROM stdin;
0	\N	\N	\N
1	Rick Astley	Mr Dr Prof	rick@roll.lol
\.


--
-- Data for Name: UniversityEvents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UniversityEvents" ("eventId", "eventName", "dateStartTime", "dateEndTime", "isHoliday") FROM stdin;
0	Dog Day	2025-06-10 00:00:00	2025-06-11 00:00:00	f
1	Cat Day	2025-05-11 08:00:00	2025-05-11 23:59:00	t
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" ("userId", username, password, role, "roleId") FROM stdin;
0	ben	\\x243262243132245a4c4e427a56384c3861796c4b554a42452e4b66766534366a457670747175616a38555374756369513556432e4a616e4f55586e4f	STUDENT	1
1	rick	\\x2432622431322430494171756445594b64333576646b525643525772653546504739417a5173384e35614b4a654a6569634b672f466e45564371576d	TEACHER	1
\.


--
-- Name: AssignmentSubmission_assignmentSubmissionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AssignmentSubmission_assignmentSubmissionId_seq"', 1, false);


--
-- Name: Assignment_assignmentId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Assignment_assignmentId_seq"', 1, false);


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

SELECT pg_catalog.setval('public."FAQ_faqId_seq"', 6, true);


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

