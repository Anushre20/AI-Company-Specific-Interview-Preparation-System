SYSTEM_PROMPT = """
You are InterviewIQ, an AI-powered interview preparation assistant.

Your job is to help candidates prepare for company-specific interviews.

You MUST follow these rules:

1. Use the provided evidence as the primary source of information.
2. Do not present unsupported information as fact.
3. Clearly distinguish official company information from candidate-reported experiences.
4. If the evidence is insufficient, say that the available evidence is insufficient.
5. Do not claim that an AI prediction is an official company interview process.
6. When discussing interview rounds, questions, topics, or eligibility, explain that these may vary by role, location, hiring cycle, and year.
7. When possible, mention the source supporting an important claim.
8. Never fabricate an interview experience or source.

Evidence Type:
- official = information published by the company.
- reported = information reported by candidates or interview experiences.
- job_description = information from a job posting.
- prediction = an inference generated from available evidence.

Answer naturally and concisely.
"""


def build_rag_prompt(question, context):
    return f"""
Answer the following candidate's question using the evidence provided below.

CANDIDATE QUESTION:
{question}

EVIDENCE:
{context}

IMPORTANT:
- Base factual claims on the evidence.
- Do not invent missing information.
- If sources disagree, mention the variation.
- Distinguish reported experiences from official information.
- If making an inference, explicitly label it as a prediction or inference.

ANSWER:
"""

def build_interview_intelligence_prompt(company, context):
    return f"""
Analyze the available interview evidence for the company: {company}

Your task is to produce an evidence-grounded interview intelligence report.

Use ONLY the provided evidence.

Do NOT treat candidate-reported experiences as guaranteed company policy.

Identify:

1. Likely interview rounds
2. Topics associated with each round
3. Frequently reported interview areas
4. Evidence supporting each round
5. Confidence level for each prediction
6. Important variations between reports
7. Any information that is insufficient or unknown

For every predicted round, classify confidence as:
- High
- Medium
- Low

Confidence should depend on the strength and consistency of the available evidence.

IMPORTANT:
- Official sources should be treated as official information.
- Candidate reports should be treated as reported experiences.
- Predictions must be explicitly identified as predictions.
- Do not invent missing rounds, eligibility requirements, salaries, durations, or questions.
- Interview processes may vary by role, location, hiring cycle, and year.

Return ONLY valid JSON in this structure:

{{
    "company": "{company}",
    "rounds": [
        {{
            "type": "OA | Technical | Managerial | HR | Other",
            "name": "round name",
            "confidence": "High | Medium | Low",
            "evidence": [
                "short evidence-based explanation"
            ],
            "topics": [
                {{
                    "name": "topic",
                    "confidence": "High | Medium | Low"
                }}
            ]
        }}
    ],
    "frequent_topics": [
        {{
            "name": "topic",
            "confidence": "High | Medium | Low"
        }}
    ],
    "variations": [
        "important variation found in the evidence"
    ],
    "unknowns": [
        "information that cannot be determined from the evidence"
    ],
    "disclaimer": "This is an evidence-based prediction and not an official company interview process."
}}

EVIDENCE:

{context}
"""