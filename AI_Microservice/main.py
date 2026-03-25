from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from sklearn.ensemble import IsolationForest
import numpy as np

app = FastAPI()

# Document Classification Model (Zero-Shot for simplicity in demo)
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
candidate_labels = ["scan", "prescription", "lab report", "general health document"]

# Fraud Detection Model (Isolation Forest)
# Mock training on some baseline upload rates/sizes (in a real app, load from a trained job)
clf_fraud = IsolationForest(contamination=0.01, random_state=42)
X_train = np.array([[1], [2], [1], [3], [1], [50]]) # mock feature: upload count/freq
clf_fraud.fit(X_train)

class ClassifyRequest(BaseModel):
    text: str

class FraudRequest(BaseModel):
    user_recent_uploads: int

@app.get("/")
def read_root():
    return {"status": "AI Microservice is running"}

@app.post("/classify")
def classify_document(req: ClassifyRequest):
    if not req.text or len(req.text.strip()) == 0:
        return {"category": "unknown", "confidence": 0}
        
    result = classifier(req.text, candidate_labels)
    best_label = result['labels'][0]
    best_score = result['scores'][0]
    return {
        "category": best_label,
        "confidence": best_score
    }

@app.post("/fraud-detect")
def detect_fraud(req: FraudRequest):
    # Predict: 1 for normal, -1 for anomaly
    is_anomaly = clf_fraud.predict([[req.user_recent_uploads]])[0] == -1
    return {
        "is_fraud_suspected": bool(is_anomaly),
        "reason": "Abnormal number of recent uploads detected" if is_anomaly else "Normal activity"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
