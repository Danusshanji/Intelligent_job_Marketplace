import pdfplumber
import re
import json
from sentence_transformers import SentenceTransformer, util

# Load model once at startup — fast after first load
print("Loading AI matching model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("AI model loaded successfully!")

SKILLS_LIST = [
    "python", "java", "javascript", "typescript", "c++", "c#", "php",
    "react", "react.js", "angular", "vue", "html", "css", "tailwind",
    "bootstrap", "next.js", "redux", "django", "flask", "fastapi",
    "node.js", "express", "spring boot", "mysql", "postgresql", "mongodb",
    "sqlite", "redis", "sql", "docker", "kubernetes", "aws", "azure",
    "git", "github", "linux", "machine learning", "deep learning",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "nlp",
    "data science", "rest api", "graphql", "agile", "scrum",
    "figma", "postman", "android", "ios", "flutter", "react native",
    "php", "laravel", "wordpress", "kotlin", "swift", "unity",
    "computer vision", "artificial intelligence", "big data", "hadoop",
]


def extract_text_from_resume(resume_path):
    """Extract all text from PDF resume."""
    text = ""
    try:
        with pdfplumber.open(resume_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
    except Exception as e:
        print(f"Error extracting resume text: {e}")
    return text.strip()


def extract_skills_from_text(text):
    """Extract skills from text using predefined skills list."""
    text_lower = text.lower()
    found_skills = set()
    for skill in SKILLS_LIST:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(skill.title())
    return list(found_skills)


def calculate_semantic_score(resume_text, job_text):
    """Calculate semantic similarity using Sentence Transformers."""
    try:
        if not resume_text or not job_text:
            return 0.0

        # Truncate to avoid memory issues
        resume_chunk = resume_text[:1000]
        job_chunk = job_text[:500]

        # Encode texts to vectors
        embeddings = model.encode([resume_chunk, job_chunk], convert_to_tensor=True)

        # Cosine similarity
        similarity = util.cos_sim(embeddings[0], embeddings[1])
        score = float(similarity[0][0])

        # Scale to 0-70 range (semantic part)
        scaled = max(0, score) * 70
        return round(scaled, 2)

    except Exception as e:
        print(f"Semantic score error: {e}")
        return 0.0


def calculate_skill_score(resume_text, skills_required):
    """Skill keyword match bonus — up to 30%."""
    if not skills_required or not resume_text:
        return 0.0

    resume_lower = resume_text.lower()
    job_skills = [s.strip().lower() for s in skills_required.split(',') if s.strip()]

    if not job_skills:
        return 0.0

    matched = 0
    for skill in job_skills:
        if skill in resume_lower:
            matched += 1

    score = (matched / len(job_skills)) * 30
    return round(score, 2)


def get_job_recommendations(resume_path, jobs):
    """
    Rank jobs for a seeker based on resume.
    Returns jobs sorted by match score.
    """
    resume_text = extract_text_from_resume(resume_path)
    if not resume_text:
        return []

    resume_skills = extract_skills_from_text(resume_text)
    print(f"Skills found in resume: {resume_skills}")

    ranked_jobs = []
    for job in jobs:
        job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('skills_required', '')}"

        # Semantic similarity (0-70)
        semantic = calculate_semantic_score(resume_text, job_text)

        # Skill match bonus (0-30)
        skill = calculate_skill_score(resume_text, job.get('skills_required', ''))

        # Final score
        final_score = min(semantic + skill, 100.0)

        ranked_jobs.append({
            **job,
            'match_score': round(final_score, 2),
            'matched_skills': [
                s for s in resume_skills
                if s.lower() in job.get('skills_required', '').lower()
            ]
        })

    ranked_jobs.sort(key=lambda x: x['match_score'], reverse=True)
    return ranked_jobs


def rank_candidates_for_job(job, applications):
    """
    Rank candidates for an employer's job posting.
    Returns applicants sorted by match score.
    """
    job_text = f"{job.get('title', '')} {job.get('description', '')} {job.get('skills_required', '')}"

    ranked = []
    for app in applications:
        resume_path = app.get('resume_path')
        if resume_path:
            resume_text = extract_text_from_resume(resume_path)
            semantic = calculate_semantic_score(resume_text, job_text)
            skill = calculate_skill_score(resume_text, job.get('skills_required', ''))
            final_score = min(semantic + skill, 100.0)
        else:
            final_score = 0.0

        ranked.append({
            **app,
            'match_score': round(final_score, 2),
        })

    ranked.sort(key=lambda x: x['match_score'], reverse=True)
    return ranked