import pdfplumber
import spacy
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Common tech skills list for better extraction
SKILLS_LIST = [
    "python", "django", "react", "javascript", "java", "c++", "c#",
    "node.js", "express", "angular", "vue", "html", "css", "tailwind",
    "bootstrap", "sql", "mysql", "postgresql", "mongodb", "sqlite",
    "rest api", "graphql", "docker", "kubernetes", "aws", "azure",
    "git", "github", "linux", "machine learning", "deep learning",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "data science", "nlp", "computer vision", "flask", "fastapi",
    "spring boot", "typescript", "redux", "next.js", "php", "laravel",
    "kotlin", "swift", "flutter", "react native", "android", "ios",
    "figma", "postman", "jira", "agile", "scrum"
]


def extract_text_from_resume(resume_path):
    """Extract all text from a PDF resume."""
    text = ""
    try:
        with pdfplumber.open(resume_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
    except Exception as e:
        print(f"Error extracting text from resume: {e}")
    return text.strip()


def extract_skills_from_text(text):
    """Extract skills from text using spaCy + skills list matching."""
    text_lower = text.lower()
    doc = nlp(text_lower)

    found_skills = set()

    # Match against known skills list
    for skill in SKILLS_LIST:
        if skill.lower() in text_lower:
            found_skills.add(skill.title())

    # Also extract noun chunks and named entities as potential skills
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.strip().lower()
        if chunk_text in SKILLS_LIST:
            found_skills.add(chunk_text.title())

    return list(found_skills)


def calculate_match_score(resume_text, job_description):
    """Calculate cosine similarity between resume and job description."""
    if not resume_text or not job_description:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        vectors = vectorizer.fit_transform([resume_text, job_description])
        score = cosine_similarity(vectors[0], vectors[1])[0][0]
        return round(float(score) * 100, 2)  # return as percentage
    except Exception as e:
        print(f"Error calculating match score: {e}")
        return 0.0
    

def get_job_recommendations(resume_path, jobs):
    """
    Match a resume against a list of jobs and return ranked results.
    
    jobs: list of dicts with 'id', 'title', 'description', 'skills_required'
    Returns: sorted list of jobs with match_score added
    """
    resume_text = extract_text_from_resume(resume_path)

    if not resume_text:
        return []

    ranked_jobs = []
    for job in jobs:
        job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('skills_required', '')}"
        score = calculate_match_score(resume_text, job_text)
        ranked_jobs.append({
            **job,
            'match_score': score
        })

    # Sort by score descending
    ranked_jobs.sort(key=lambda x: x['match_score'], reverse=True)
    return ranked_jobs


def rank_candidates_for_job(job, applications):
    """
    Rank applicants for a specific job based on resume match score.
    
    job: dict with 'title', 'description', 'skills_required'
    applications: list of dicts with 'id', 'applicant_name', 'resume_path'
    Returns: sorted list of applicants with match_score added
    """
    job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('skills_required', '')}"

    ranked = []
    for app in applications:
        resume_path = app.get('resume_path')
        if resume_path:
            resume_text = extract_text_from_resume(resume_path)
            score = calculate_match_score(resume_text, job_text)
        else:
            score = 0.0

        ranked.append({
            **app,
            'match_score': score
        })

    ranked.sort(key=lambda x: x['match_score'], reverse=True)
    return ranked