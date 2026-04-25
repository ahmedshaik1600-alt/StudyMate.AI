/**
 * Mock data for StudyMate AI
 * TODO: Replace all mock data with actual API responses from Python backend
 * Recommended: FastAPI (POST endpoints returning JSON)
 */

export const mockSummary = {
  title: "Introduction to Machine Learning",
  generatedAt: "2026-04-05T10:30:00Z",
  type: "Exam-focused",
  difficulty: "Intermediate",
  sections: [
    {
      heading: "What is Machine Learning?",
      bullets: [
        "Machine Learning is a subset of Artificial Intelligence that enables systems to learn from data.",
        "It focuses on developing algorithms that improve automatically through experience.",
        "Three main types: Supervised, Unsupervised, and Reinforcement Learning.",
      ],
    },
    {
      heading: "Key Concepts",
      bullets: [
        "Training Data: The dataset used to teach the model patterns and relationships.",
        "Features: Individual measurable properties used as input variables.",
        "Model: A mathematical representation that maps inputs to outputs.",
        "Overfitting: When a model learns noise instead of the underlying pattern.",
      ],
    },
    {
      heading: "Important Terms",
      bullets: [
        "Neural Network — A computing system inspired by biological neural networks.",
        "Gradient Descent — An optimization algorithm for finding minimum of a function.",
        "Cross-validation — A technique to evaluate model performance on unseen data.",
      ],
    },
  ],
  quickTakeaways: [
    "ML automates pattern recognition from data",
    "Choose the right algorithm based on your data type",
    "Always validate models with test data",
    "Regularization helps prevent overfitting",
  ],
};

export const mockFlashcards = [
  { id: 1, question: "What is Supervised Learning?", answer: "A type of ML where the model is trained on labeled data, learning to map inputs to known outputs.", difficulty: "Beginner" },
  { id: 2, question: "Define Overfitting", answer: "When a model learns the training data too well, including noise, resulting in poor performance on new data.", difficulty: "Intermediate" },
  { id: 3, question: "What is Gradient Descent?", answer: "An optimization algorithm that iteratively adjusts parameters to minimize a loss function by following the negative gradient.", difficulty: "Advanced" },
  { id: 4, question: "What are Features in ML?", answer: "Individual measurable properties or characteristics of the data used as input variables for a model.", difficulty: "Beginner" },
  { id: 5, question: "Explain Cross-Validation", answer: "A technique where the dataset is split into multiple folds, with each fold used as both training and test data to evaluate model robustness.", difficulty: "Intermediate" },
  { id: 6, question: "What is a Neural Network?", answer: "A computing system composed of interconnected nodes (neurons) organized in layers, inspired by biological neural networks.", difficulty: "Beginner" },
];

export const mockQuiz = [
  {
    id: 1,
    question: "Which type of learning uses labeled training data?",
    options: ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Transfer Learning"],
    correctIndex: 1,
    explanation: "Supervised Learning uses labeled data where each training example has a known output, allowing the model to learn the mapping function.",
  },
  {
    id: 2,
    question: "What does overfitting mean?",
    options: ["Model is too simple", "Model memorizes training data", "Model has too few parameters", "Model trains too slowly"],
    correctIndex: 1,
    explanation: "Overfitting occurs when a model learns the training data too well, capturing noise and failing to generalize to new data.",
  },
  {
    id: 3,
    question: "What is the purpose of a validation set?",
    options: ["Train the model", "Evaluate model during training", "Deploy the model", "Collect more data"],
    correctIndex: 1,
    explanation: "A validation set is used to tune hyperparameters and evaluate the model during training without touching the test set.",
  },
  {
    id: 4,
    question: "Which algorithm adjusts model parameters iteratively?",
    options: ["Random Forest", "K-Means", "Gradient Descent", "Decision Tree"],
    correctIndex: 2,
    explanation: "Gradient Descent iteratively adjusts parameters by computing the gradient of the loss function and moving in the direction that minimizes it.",
  },
  {
    id: 5,
    question: "What is a feature in machine learning?",
    options: ["A model output", "An input variable", "A training algorithm", "A loss function"],
    correctIndex: 1,
    explanation: "A feature is an individual measurable property of the data that serves as an input variable for the machine learning model.",
  },
];

export const mockSimplifiedNotes = {
  title: "Machine Learning — Simplified",
  level: "Very Easy",
  bullets: [
    "🤖 Machine Learning = Teaching computers to learn from examples",
    "📊 You give it data, it finds patterns on its own",
    "🏷️ Supervised Learning = Learning with answers provided (like a teacher)",
    "🔍 Unsupervised Learning = Finding hidden patterns without answers",
    "⚠️ Overfitting = When the computer memorizes instead of understanding",
    "✅ Always test your model with new data it hasn't seen before",
    "📈 More quality data usually means better results",
    "🧠 Neural Networks are inspired by how our brains work",
  ],
};

export const mockUploadedFiles = [
  { id: "1", name: "ML_Chapter_3.pdf", type: "PDF", size: "2.4 MB", status: "ready" as const },
  { id: "2", name: "lecture_notes.docx", type: "DOCX", size: "890 KB", status: "processing" as const },
];

export const featureHighlights = [
  { icon: "Upload", title: "Upload Material", description: "PDF, DOCX, TXT files" },
  { icon: "FileText", title: "Paste Notes", description: "Paste class notes directly" },
  { icon: "Brain", title: "AI Summaries", description: "Smart chapter summaries" },
  { icon: "Layers", title: "Flashcards", description: "Revision flashcards" },
  { icon: "HelpCircle", title: "Quizzes", description: "Self-test questions" },
  { icon: "Gauge", title: "Difficulty", description: "Choose your level" },
  { icon: "Zap", title: "Study Faster", description: "AI-powered speed" },
  { icon: "Volume2", title: "Text to Speech", description: "Listen to notes" },
  { icon: "Sparkles", title: "Simplify", description: "Make notes easier" },
  { icon: "RefreshCw", title: "Regenerate", description: "Get new versions" },
];
