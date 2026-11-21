import re
import math
from typing import Dict, Any, List, Tuple
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
from pathlib import Path
import pypdf

# Initialize VADER analyzer
vader = SentimentIntensityAnalyzer()

# Domain-specific sentiment lexicon extensions
DOMAIN_LEXICON = {
    "extraordinary": 3.2,
    "blazing": 2.5,
    "blazingly": 2.5,
    "seamless": 2.8,
    "seamlessly": 2.8,
    "intuitive": 2.7,
    "intuitively": 2.7,
    "flawless": 3.4,
    "flawlessly": 3.4,
    "superb": 3.2,
    "brilliant": 3.1,
    "stunning": 3.0,
    "innovative": 2.8,
    "unmatched": 2.6,
    "terrific": 3.0,
    "exceptional": 3.2,
    "exceptionally": 3.2,
    "top-notch": 3.3,
    "reliable": 2.4,
    "dependable": 2.4,
    "crashed": -2.8,
    "glitchy": -2.4,
    "unresponsive": -2.6,
    "slow": -1.8,
    "delayed": -1.5,
    "frustrating": -2.7,
    "appalling": -3.2,
    "disastrous": -3.4,
    "buggy": -2.4,
    "broken": -2.5,
    "disappointing": -2.6,
    "disappointed": -2.5,
    "subpar": -2.2,
    "unusable": -3.0
}
vader.lexicon.update(DOMAIN_LEXICON)

# Emotion lexicon anchors
EMOTION_KEYWORDS = {
    "Joy": [
        "happy", "joy", "delighted", "love", "loved", "loving", "great", "excellent", "superb", 
        "amazing", "fantastic", "wonderful", "awesome", "pleased", "excited", "thrilled", "glad",
        "brilliant", "perfect", "blessed", "enjoy", "celebrate", "satisfied", "impressive", "flawless"
    ],
    "Sadness": [
        "sad", "unhappy", "depressed", "miserable", "sorrow", "grief", "disappointed", "hopeless",
        "hurt", "lonely", "heartbroken", "down", "regret", "pity", "crying", "gloomy", "tragic", "loss"
    ],
    "Anger": [
        "angry", "mad", "furious", "outraged", "irritated", "annoyed", "hate", "hated", "disgusted",
        "terrible", "horrible", "worst", "awful", "scam", "cheat", "rip-off", "infuriating", "appalling"
    ],
    "Fear": [
        "afraid", "scared", "fear", "anxious", "nervous", "terrified", "worried", "panic", "dread",
        "alarmed", "vulnerable", "threatened", "insecure", "risky", "hesitant", "suspicious"
    ],
    "Surprise": [
        "surprised", "shocked", "amazed", "astonished", "unexpected", "unbelievable", "stunned",
        "jaw-dropping", "abrupt", "remarkable", "sudden", "curious"
    ],
    "Trust": [
        "trust", "reliable", "secure", "confident", "recommend", "consistent", "honest", "integrity",
        "dependable", "safe", "verified", "authentic", "stable", "loyal"
    ]
}

STOPWORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
}

def analyze_sentiment(text: str) -> Dict[str, Any]:
    clean_text = text.strip()
    if not clean_text:
        return {
            "sentiment": "Neutral",
            "confidence": 50.0,
            "score": 0.0,
            "emotions": {"Neutral": 100},
            "keywords": [],
            "explanation": "No text provided for analysis.",
            "classification_details": {"positive": 0, "neutral": 100, "negative": 0, "compound": 0}
        }

    # 1. VADER scoring
    scores = vader.polarity_scores(clean_text)
    compound = scores["compound"]
    pos = scores["pos"]
    neu = scores["neu"]
    neg = scores["neg"]

    # Classification & confidence
    if compound >= 0.05:
        sentiment = "Positive"
        # Confidence calculation based on margin and compound magnitude
        confidence = min(99.0, max(52.0, (compound * 40.0) + (pos * 50.0) + 20.0))
    elif compound <= -0.05:
        sentiment = "Negative"
        confidence = min(99.0, max(52.0, (abs(compound) * 40.0) + (neg * 50.0) + 20.0))
    else:
        sentiment = "Neutral"
        confidence = min(98.0, max(50.0, (neu * 70.0) + 20.0))

    confidence = round(confidence, 1)
    normalized_score = round(compound, 3)

    # 2. Emotion Detection
    lower_words = re.findall(r"\b[a-z]{3,}\b", clean_text.lower())
    emotion_counts = {k: 0 for k in EMOTION_KEYWORDS}
    
    for word in lower_words:
        for emotion, kw_list in EMOTION_KEYWORDS.items():
            if word in kw_list:
                emotion_counts[emotion] += 1

    total_emotion_hits = sum(emotion_counts.values())
    if total_emotion_hits > 0:
        emotion_percentages = {
            k: round((v / total_emotion_hits) * 100, 1)
            for k, v in emotion_counts.items() if v > 0
        }
    else:
        # Default distribution based on sentiment
        if sentiment == "Positive":
            emotion_percentages = {"Joy": 65.0, "Trust": 35.0}
        elif sentiment == "Negative":
            emotion_percentages = {"Anger": 60.0, "Sadness": 40.0}
        else:
            emotion_percentages = {"Neutral": 100.0}

    # 3. Important Keywords Extraction
    word_freq = {}
    for word in lower_words:
        if word not in STOPWORDS and len(word) > 2:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Score keywords by frequency and VADER polarity
    keyword_list = []
    for word, count in sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]:
        w_score = vader.polarity_scores(word)["compound"]
        w_type = "positive" if w_score > 0.1 else ("negative" if w_score < -0.1 else "neutral")
        keyword_list.append({
            "word": word,
            "weight": count,
            "type": w_type,
            "polarity": round(w_score, 2)
        })

    # 4. AI-Generated Explanation
    primary_emotion = max(emotion_percentages.items(), key=lambda x: x[1])[0] if emotion_percentages else "Neutral"
    top_pos_kws = [k["word"] for k in keyword_list if k["type"] == "positive"][:3]
    top_neg_kws = [k["word"] for k in keyword_list if k["type"] == "negative"][:3]

    if sentiment == "Positive":
        if top_pos_kws:
            kw_mention = f"strong sentiment indicators such as '{', '.join(top_pos_kws)}'"
        else:
            kw_mention = "favorable tonal markers and affirmation"
        explanation = (
            f"The input exhibits an overall Positive sentiment with {confidence}% confidence (score: {normalized_score}). "
            f"The predominant emotional driver is {primary_emotion}, reinforced by {kw_mention}. "
            f"The syntactic phrasing reflects constructive customer satisfaction and high approval."
        )
    elif sentiment == "Negative":
        if top_neg_kws:
            kw_mention = f"critical or dissatisfied terminology like '{', '.join(top_neg_kws)}'"
        else:
            kw_mention = "adversarial or distressed tonality"
        explanation = (
            f"The input is evaluated as Negative with {confidence}% confidence (score: {normalized_score}). "
            f"Analysis reveals elevated markers of {primary_emotion}, driven by {kw_mention}. "
            f"The context indicates pain points, unresolved frustration, or customer grievance."
        )
    else:
        explanation = (
            f"The input is classified as Neutral with {confidence}% confidence (score: {normalized_score}). "
            f"The statement conveys objective, descriptive, or informational content without significant "
            f"polarized emotional polarity ({primary_emotion})."
        )

    # 5. Text Classification Breakdown
    classification_details = {
        "positive": round(pos * 100, 1),
        "neutral": round(neu * 100, 1),
        "negative": round(neg * 100, 1),
        "compound": normalized_score,
        "subjectivity": round((pos + neg), 3),
        "primary_emotion": primary_emotion
    }

    return {
        "sentiment": sentiment,
        "confidence": confidence,
        "score": normalized_score,
        "emotions": emotion_percentages,
        "keywords": keyword_list,
        "explanation": explanation,
        "classification_details": classification_details
    }


def parse_and_analyze_file(file_path: Path, text_column: str = None) -> Dict[str, Any]:
    suffix = file_path.suffix.lower()
    records = []

    if suffix == ".csv":
        df = pd.read_csv(file_path)
    elif suffix in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path)
    elif suffix == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = [line.strip() for line in f if line.strip()]
        df = pd.DataFrame({"text": lines})
    elif suffix == ".pdf":
        lines = []
        reader = pypdf.PdfReader(str(file_path))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                for line in t.split("\n"):
                    if line.strip():
                        lines.append(line.strip())
        df = pd.DataFrame({"text": lines})
    else:
        raise ValueError(f"Unsupported file format: {suffix}")

    if df.empty:
        raise ValueError("File contains no readable text records.")

    # Determine candidate text column
    target_col = None
    if text_column and text_column in df.columns:
        target_col = text_column
    else:
        # Auto-detect best text column
        for col in df.columns:
            if any(term in str(col).lower() for term in ["text", "review", "comment", "feedback", "sentence", "content", "message"]):
                target_col = col
                break
        if not target_col:
            # Pick first column with string type or longest average length
            for col in df.columns:
                sample = df[col].dropna().astype(str)
                if not sample.empty and sample.str.len().mean() > 10:
                    target_col = col
                    break
        if not target_col:
            target_col = df.columns[0]

    analyzed_rows = []
    pos_count = 0
    neg_count = 0
    neu_count = 0

    for idx, row in df.iterrows():
        raw_val = str(row[target_col]) if pd.notna(row[target_col]) else ""
        res = analyze_sentiment(raw_val)
        
        if res["sentiment"] == "Positive":
            pos_count += 1
        elif res["sentiment"] == "Negative":
            neg_count += 1
        else:
            neu_count += 1

        row_dict = row.to_dict()
        row_dict["_sentiment_scope_sentiment"] = res["sentiment"]
        row_dict["_sentiment_scope_confidence"] = res["confidence"]
        row_dict["_sentiment_scope_score"] = res["score"]
        analyzed_rows.append(row_dict)

    # Save analyzed dataset back
    analyzed_df = pd.DataFrame(analyzed_rows)
    analyzed_path = file_path.parent / f"analyzed_{file_path.name}"
    
    if suffix in [".xlsx", ".xls"]:
        analyzed_df.to_excel(analyzed_path, index=False)
    else:
        # Default to CSV for easy download
        analyzed_path = analyzed_path.with_suffix(".csv")
        analyzed_df.to_csv(analyzed_path, index=False)

    return {
        "total_rows": len(analyzed_rows),
        "target_column": target_col,
        "available_columns": list(df.columns),
        "positive_count": pos_count,
        "negative_count": neg_count,
        "neutral_count": neu_count,
        "analyzed_file_path": str(analyzed_path),
        "preview": analyzed_rows[:15]
    }
