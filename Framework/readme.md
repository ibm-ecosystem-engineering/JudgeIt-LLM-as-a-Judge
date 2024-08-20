#### Framework: JudgeIt

This directory contains the backend code written in Python for different types of LLM judges. It includes modules for evaluating different types of tasks, such as:

- **RAG Evaluation**
- **Multi-Turn Query Rewrite Evaluation**
- **Text to SQL Evaluation**
![LLM-Judges](/images/flow-diagram.png)


**Key Files:**
- `answer_similarity.py`: LLM-judge for RAG evaluation based on similarity with the golden answer
- `answer_rating.py`: LLM-judge for RAG evaluation based on rating compared with the golden answer
- `multi_turn_eval.py`: LLM-judge for multi-turn query rewrite evaluation

![Multi-turn evaluation results](/images/multi-turn-evaluation.png)

**Instructions:**
1. Ensure all dependencies are installed by running `pip install -r requirements.txt`.
2. Configure your environment in the `config.ini` file.
3. Run the framework using `python main.py`.
