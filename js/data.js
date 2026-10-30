/**
 * js/data.js — Centralized Public Portfolio Data (Model)
 * IMPORTANT: This file is served publicly to every visitor.
 * NEVER store passwords, hashes, session secrets, or private keys here.
 */

const portfolioData = {
  "personal": {
    "name": "Isratul Ibnat Orpa",
    "preferredName": "Orpa",
    "title": "CSE STUDENT · AIUB",
    "headlineFirst": "Hi, I'm",
    "headlineSecond": "Orpa.",
    "tagline": "I build, learn and explore.",
    "intro": "I am a Computer Science and Engineering student at American International University-Bangladesh (AIUB). I enjoy mathematics, exploring research problems and building technology projects. I am preparing to begin my professional journey in the technology industry.",
    "brandQuote": "A curious CSE student with a passion for mathematics, research, and building technology beyond the ordinary.",
    "profileImage": "assets/images/profile.jpg",
    "academicStanding": "Undergraduate student, 10th semester as of October 2026",
    "publishAcademicMetrics": false,
    "reportedCgpa": "3.72 (Reported Oct 2025 — pending 10th-semester verification)",
    "mathCoursesSummary": "Completed 6 university mathematics courses (4 courses with marks of 95+ and 2 courses with 87, pending final transcript confirmation)",
    "currentFocus": {
      "label": "CURRENT FOCUS",
      "heading": "Learning by building",
      "subtitle": "Web development · Research · Problem solving",
      "availability": "Open to internship opportunities"
    },
    "aboutParagraphs": [
      "I am a curious and analytical CSE student who enjoys understanding problems, exploring ideas, and learning how technology can address real-world challenges.",
      "Mathematics is one of my strongest academic interests, and I am increasingly interested in academic research, particularly image-based machine learning and deep learning.",
      "Alongside my academic studies, I am learning web development and working on building a professional online presence. My goal is to strengthen my technical abilities, gain practical industry experience, contribute to meaningful projects, and continue developing as a technology professional."
    ],
    "qualities": [
      {
        "id": "q-1",
        "title": "Curiosity & Willingness to Learn",
        "description": "Exploring unfamiliar concepts through self-learning and academic inquiry."
      },
      {
        "id": "q-2",
        "title": "Mathematics & Analytical Problem-Solving",
        "description": "Strong quantitative foundation across six university mathematics courses and Data Structures."
      },
      {
        "id": "q-3",
        "title": "Research-Oriented Thinking",
        "description": "Investigating image-based machine learning and deep learning methodologies carefully."
      },
      {
        "id": "q-4",
        "title": "Technology & Practical Projects",
        "description": "Hands-on academic projects in embedded systems, digital logic, and web development."
      },
      {
        "id": "q-5",
        "title": "Commitment to Continuous Improvement",
        "description": "Iterating transparently on hardware and software engineering challenges."
      },
      {
        "id": "q-6",
        "title": "Professional & Communication Growth",
        "description": "Developing presentation clarity and collaborative readiness for industry roles."
      }
    ]
  },
  "navigation": [
    {
      "id": "about",
      "label": "About"
    },
    {
      "id": "education",
      "label": "Education"
    },
    {
      "id": "experience",
      "label": "Experience"
    },
    {
      "id": "projects",
      "label": "Projects"
    },
    {
      "id": "research",
      "label": "Research"
    },
    {
      "id": "skills",
      "label": "Skills"
    },
    {
      "id": "achievements",
      "label": "Achievements"
    },
    {
      "id": "resume",
      "label": "Resume"
    },
    {
      "id": "contact",
      "label": "Contact"
    }
  ],
  "education": [
    {
      "id": "edu-aiub",
      "institution": "American International University-Bangladesh (AIUB)",
      "degree": "Bachelor of Science in Computer Science and Engineering (CSE)",
      "period": "Started 2023 · 10th Semester as of October 2026",
      "result": "Undergraduate Student",
      "details": "Completed Data Structures and six university mathematics courses. Expected graduation date to be confirmed."
    },
    {
      "id": "edu-dcc",
      "institution": "Dhaka Commerce College",
      "degree": "Intermediate-Level Education (Higher Secondary Certificate — HSC)",
      "period": "2020 – 2022",
      "result": "GPA 5.00",
      "details": "Completed higher secondary education with a GPA of 5.00."
    },
    {
      "id": "edu-monipur",
      "institution": "Monipur High School and College",
      "degree": "Secondary School Certificate (SSC — Bangla Version)",
      "period": "2010 – 2020",
      "result": "GPA 4.89",
      "details": "Completed secondary school education in the Bangla version."
    }
  ],
  "experience": {
    "statement": "I am currently developing my technical portfolio, strengthening my practical skills, and preparing for internship opportunities.",
    "entries": [],
    "careerObjectives": [
      {
        "id": "obj-1",
        "text": "Build a strong, professional portfolio."
      },
      {
        "id": "obj-2",
        "text": "Present my academic projects clearly and honestly."
      },
      {
        "id": "obj-3",
        "text": "Develop my web development skills."
      },
      {
        "id": "obj-4",
        "text": "Explore academic research opportunities."
      },
      {
        "id": "obj-5",
        "text": "Strengthen core computer science and technical fundamentals."
      },
      {
        "id": "obj-6",
        "text": "Gain practical industry experience through internships."
      },
      {
        "id": "obj-7",
        "text": "Improve my communication and professional skills."
      }
    ]
  },
  "projects": [
    {
      "id": "proj-portfolio",
      "title": "Personal Portfolio Website",
      "category": "Frontend Web Development · 3D Web Design",
      "status": "In Development",
      "iconType": "code",
      "thumbnail": "assets/images/projects/portfolio-preview.svg",
      "images": [
        "assets/images/projects/portfolio-preview.svg"
      ],
      "description": "An MVC-structured personal portfolio presenting my academic background, projects, research interests, certifications, and resume, featuring an interactive Three.js 3D thinking character and hanging lamp in Current Focus.",
      "technologies": [
        "HTML5",
        "CSS3",
        "JavaScript (MVC)",
        "Three.js",
        "Node.js"
      ],
      "implementationNotes": "Status: In development. Planned features are marked transparently as they are implemented and tested.",
      "repoUrl": "",
      "liveUrl": ""
    },
    {
      "id": "proj-security",
      "title": "Smart Security System",
      "category": "Embedded Systems · Microcontrollers",
      "status": "Academic Project",
      "iconType": "cpu",
      "thumbnail": "assets/images/projects/smart-security-preview.svg",
      "images": [
        "assets/images/projects/smart-security-preview.svg"
      ],
      "description": "An academic security-system project exploring keypad-based access control and a web-based password interface.",
      "technologies": [
        "4x4 Keypad",
        "ESP32 Web Interface Concept",
        "OLED Display",
        "LED Indicators"
      ],
      "implementationNotes": "During simulation, a push switch was used because ESP32 and Wi-Fi functionality were unavailable in the simulation environment. The hardware display also required troubleshooting.",
      "repoUrl": "",
      "liveUrl": ""
    },
    {
      "id": "proj-bell",
      "title": "Automated Bell System",
      "category": "Digital Logic · Sequential Systems",
      "status": "Academic Project",
      "iconType": "clock",
      "thumbnail": "assets/images/projects/automated-bell-preview.svg",
      "images": [
        "assets/images/projects/automated-bell-preview.svg"
      ],
      "description": "An academic digital logic project exploring how sequential logic components, pulse generation, and counters can automate a bell system.",
      "technologies": [
        "Pulse Generation",
        "Counter Input",
        "Sequential Output",
        "Time Tracking"
      ],
      "implementationNotes": "Demonstrates synchronous state progression from clock pulses through binary counters to trigger scheduled outputs.",
      "repoUrl": "",
      "liveUrl": ""
    }
  ],
  "research": [
    {
      "id": "res-hairloss",
      "title": "Hair-Loss Severity Assessment Using Deep Learning",
      "status": "Topic Exploration / Proposed Research",
      "organization": "American International University-Bangladesh (AIUB) — Undergraduate Research Exploration",
      "date": "Ongoing Exploration",
      "summary": "Exploring image-based machine learning and deep learning methods to investigate whether visible hair-loss severity or stage can be assessed from scalp images.",
      "directions": [
        "Analyze scalp images and surface-level visual features.",
        "Investigate whether visible hair-loss severity or stage can be assessed from standardized images.",
        "Explore suitable datasets and image-processing methods.",
        "Compare appropriate machine-learning and deep-learning models.",
        "Evaluate model predictions against reliable expert-annotated or clinically assessed labels where available."
      ],
      "scopeLimitation": "Scalp images alone should not be used to claim that the system can diagnose the underlying biological cause of hair loss, such as hormonal, nutritional, or genetic causes. No completed experiments, model accuracy metrics, or published papers are claimed prior to verification.",
      "supervisor": ""
    }
  ],
  "researchDomains": [
    "Computer Vision",
    "Image Classification",
    "Machine Learning",
    "Deep Learning",
    "Practical AI Applications",
    "Research Methodology & Dataset Analysis"
  ],
  "skills": [
    {
      "id": "sk-math",
      "name": "Mathematics",
      "group": "Academic & Analytical",
      "context": "Completed 6 university courses",
      "description": "Quantitative modeling and analytical problem-solving."
    },
    {
      "id": "sk-analytical",
      "name": "Analytical Thinking",
      "group": "Academic & Analytical",
      "context": "Core academic strength",
      "description": "Decomposing engineering and research problems systematically."
    },
    {
      "id": "sk-problem",
      "name": "Problem-Solving",
      "group": "Academic & Analytical",
      "context": "Coursework & competitive coding",
      "description": "Applying logical deduction in algorithms and digital systems."
    },
    {
      "id": "sk-research",
      "name": "Research Exploration",
      "group": "Academic & Analytical",
      "context": "Literature & methodology review",
      "description": "Exploring dataset design and evaluation criteria for deep learning."
    },
    {
      "id": "sk-ds",
      "name": "Data Structures Fundamentals",
      "group": "Academic & Analytical",
      "context": "Completed AIUB coursework",
      "description": "Foundational data organization and algorithmic analysis."
    },
    {
      "id": "sk-html",
      "name": "HTML",
      "group": "Technical Learning Areas",
      "context": "Frontend web development",
      "description": "Semantic, accessible document structure."
    },
    {
      "id": "sk-css",
      "name": "CSS",
      "group": "Technical Learning Areas",
      "context": "Responsive styling & themes",
      "description": "Minimal Light/Dark design systems and responsive layouts."
    },
    {
      "id": "sk-js",
      "name": "JavaScript",
      "group": "Technical Learning Areas",
      "context": "Interactive web applications",
      "description": "MVC client logic, DOM rendering, and Three.js integration."
    },
    {
      "id": "sk-web",
      "name": "Web Development",
      "group": "Technical Learning Areas",
      "context": "Active learning area",
      "description": "Building maintainable frontend and Node.js portfolio systems."
    },
    {
      "id": "sk-embedded",
      "name": "Embedded Systems & Microcontrollers",
      "group": "Technical Learning Areas",
      "context": "Academic project experience",
      "description": "Working with 4x4 keypads, ESP32 concepts, OLED displays, and circuit simulation."
    },
    {
      "id": "sk-dld",
      "name": "Digital Logic",
      "group": "Technical Learning Areas",
      "context": "Academic project experience",
      "description": "Sequential circuits, counters, and pulse generation."
    },
    {
      "id": "sk-cvdl",
      "name": "Computer Vision & Deep Learning",
      "group": "Technical Learning Areas",
      "context": "Research exploration",
      "description": "Exploring image classification architectures and dataset preprocessing."
    },
    {
      "id": "sk-git",
      "name": "Git & GitHub",
      "group": "Technical Learning Areas",
      "context": "Version control",
      "description": "Source code management and repository workflows."
    }
  ],
  "certifications": [
    {
      "id": "cert-cisco",
      "title": "Cisco Cybersecurity Badge",
      "issuer": "Cisco Networking Academy",
      "date": "Date to be verified",
      "image": "assets/images/certificates/cisco-cybersecurity-placeholder.svg",
      "verifyUrl": ""
    },
    {
      "id": "cert-hplife-email",
      "title": "HP LIFE — Business Email",
      "issuer": "HP LIFE (HP Foundation)",
      "date": "Date to be verified",
      "image": "assets/images/certificates/hplife-email-placeholder.svg",
      "verifyUrl": ""
    },
    {
      "id": "cert-hplife-ai",
      "title": "HP LIFE — AI Beginners",
      "issuer": "HP LIFE (HP Foundation)",
      "date": "Date to be verified",
      "image": "assets/images/certificates/hplife-ai-placeholder.svg",
      "verifyUrl": ""
    },
    {
      "id": "cert-presentation",
      "title": "Effective Presentation Certificate",
      "issuer": "Issuing organization to be verified",
      "date": "Date to be verified",
      "image": "assets/images/certificates/presentation-placeholder.svg",
      "verifyUrl": ""
    }
  ],
  "achievements": [
    {
      "id": "ach-codechef-bronze",
      "title": "CodeChef Bronze Achievement",
      "issuer": "CodeChef",
      "category": "Coding Achievement",
      "date": "Verified Platform Badge",
      "description": "Recognizes foundational algorithmic problem-solving and competitive programming participation on CodeChef.",
      "verifyUrl": ""
    },
    {
      "id": "ach-codechef-streak",
      "title": "CodeChef Streak Badges",
      "issuer": "CodeChef",
      "category": "Coding Consistency",
      "date": "Consistency Milestone",
      "description": "Earned through regular problem-solving streaks and consistent coding practice.",
      "verifyUrl": ""
    },
    {
      "id": "ach-rotaract-best",
      "title": "Rotaract DCC Best Member Award",
      "issuer": "Rotaract Club of Dhaka Commerce College",
      "category": "Extracurricular Recognition",
      "date": "Dhaka Commerce College Tenure",
      "description": "Awarded in recognition of dedication, teamwork, and active contribution at Rotaract DCC.",
      "verifyUrl": ""
    }
  ],
  "socialLinks": [
    {
      "id": "soc-github",
      "platform": "GitHub",
      "url": "",
      "label": "Add actual GitHub URL in data.js or Admin"
    },
    {
      "id": "soc-linkedin",
      "platform": "LinkedIn",
      "url": "",
      "label": "Add actual LinkedIn URL in data.js or Admin"
    }
  ],
  "contact": {
    "email": "23-54405-3@student.aiub.edu",
    "phone": "",
    "location": "Dhaka, Bangladesh"
  },
  "resume": {
    "file": "resume.pdf",
    "downloadFilename": "Isratul_Ibnat_Orpa_Resume.pdf",
    "lastUpdatedNote": "Replace my-portfolio/resume.pdf with your final signed CV PDF at any time."
  }
};

if (typeof window !== "undefined") {
  window.portfolioData = portfolioData;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = portfolioData;
}
