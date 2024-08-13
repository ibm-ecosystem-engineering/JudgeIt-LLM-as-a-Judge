

## function for query_rating 
def build_prompt_response_rating_question(question,gold_answer,response1,model_id="MIXTRAL"):

    instruction ="""You are provided a pair of question answer.
    You need to compare an alternate answer with the actual answer provide rating for each answer."""
    
    SYSTEM_PROMPT = """You are an AI assistant for Juniper to help in evaluating, comparing and rating the answers.
    """    
    
    rating = """
    1.Gibberish/Incorrect/Wrong
    2.Partially correct
    3.Correct but incomplete/truncated sentence
    4.Correct but repetitive phrases/sentences
    5.Excellent answer
    """

    Rating_PROMPT = """###Task Description:
    You are provided an alternate answer {response_1} for a question {question}. The actual answer is {golden_answer}. 
    You need to compare the alternate answer {response_1} with the actual answer: {golden_answer} and provide {rating} for the answer.
    1. Use the {golden_answer} as reference answer for the {question} and provide {rating} for the {response_1} 
    2. Write a feedback on the answer.
    3. The output format should be a valid short JSON object with following keys Rating and Feedback 
        and their respective values: rating for {response_1}, write a feedback for the rating. Do not include any other key value like V5_Answer and Golden Answer and do not inlcude multiple same object in output.
    4. Please do not generate any other opening, closing, and explanations.
    ###Instruction:
    {instruction}
    ###v5_Answer:
    {response_1}
    ###Question:
    {question}
    ###Golden Answer:
    {golden_answer}

    ### Rating:
    {rating}
    ###Feedback: 
    """

    MIXTRAL_PROMPT = """[INST]
    [ROLE]
    {system_prompt}
    [/ROLE]
    [USER_INSTRUCTIONS]
    {user_prompt}
    [/USER_INSTRUCTIONS]
    [/INST]"""

    LLAMA3_PROMPT= """
    <|begin_of_text|><|start_header_id|>system<|end_header_id|>
    {system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>
    {user_prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
     """
    
    user_prompt = Rating_PROMPT.format(question=question,rating = rating,golden_answer=gold_answer,instruction=instruction,response_1=response1)

    if  model_id == "MIXTRAL":
        formatted_prompt = MIXTRAL_PROMPT.format(system_prompt=SYSTEM_PROMPT,user_prompt=user_prompt)
    elif model_id == "LLAMA3":
        formatted_prompt = LLAMA3_PROMPT.format(system_prompt=SYSTEM_PROMPT,user_prompt=user_prompt)
    return formatted_prompt