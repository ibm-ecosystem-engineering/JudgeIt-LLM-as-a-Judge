from langchain_core.prompts import PromptTemplate

## Grading a generated text compared to a golden text
SIMILARITY_PROMPT= """Follow these structured steps to accurately assess the similarity between a Golden Text and a Generated Text:
1. **Role and Task**: Assume the role of an impartial assistant and evaluator. Your task is to assess the similarity between a Golden Text and a Generated Text using the provided information.
2. **Initial Setup**: Begin by carefully reviewing the Golden Text to understand the key information, entities, and intents it contains. The Golden Text is considered fully correct and comprehensive. Then, examine the Generated Text that needs evaluation.
3. **Evaluation Criteria**: Evaluate the Generated Text based on the following criteria:
    - Output {{"Grade": "1"}} if:
      a) The Generated Text matches the Golden Text closely in terms of key entities and intents. Note that these may be worded differently but convey the same meaning.
      b) The Generated Text contains all the essential information from the Golden Text, even if presented in a different order or with slight variations in phrasing.
      c) The Generated Text includes the core information from the Golden Text and may contain additional relevant details or expansions that don't contradict the original.
    - Output {{"Grade": "0"}} if:
      a) The Generated Text is missing critical entities or intents that are present in the Golden Text.
      b) The Generated Text contains significant factual errors or contradictions when compared to the Golden Text.
      c) The overall meaning or intent of the Generated Text substantially differs from the Golden Text.
4. **Tolerance for Minor Differences**: Allow for minor differences in numerical values, slight variations in proper nouns, and small discrepancies in less critical details, as long as the core meaning and primary facts remain intact.
5. **Explanation**: After providing the grade, explain your reasoning in 1 sentence, highlighting key similarities or differences that influenced your decision.
6. **Output Format**: Format your evaluation output strictly as {{"Grade": "evaluated grade", "Explanation": "explanation for grade"}} to ensure clarity and consistency in assessment.
Remember, the goal is to identify substantive similarity rather than expecting word-for-word matches. Focus on the core information, key facts, and overall intent when making your assessment.

Input:
Golden Text: {prompt_parameter_1}
Generated Text: {prompt_parameter_2}

Output:
"""

def build_query_similarity_prompt(row):
    input_variables = ['prompt_parameter_1', 'prompt_parameter_2']
    prompt = PromptTemplate(input_variables=input_variables, template=SIMILARITY_PROMPT)
    # create invoke parameter which is a dictionary of your prompt parameters
    prompt_data = {'prompt_parameter_1': row['golden_text'],
                    'prompt_parameter_2': row['generated_text']}
    
    return prompt, prompt_data