import re
import html
import json
import ast
import pandas as pd
import time
from time import sleep
from ibm_watsonx_ai.foundation_models import ModelInference

import itertools
from functools import lru_cache
from random import random
import concurrent.futures as cf

credentials = {}
project_id = ""


def safe_parse_agent_output(x):
    if isinstance(x, dict):
        return x
    if pd.isna(x) or x is None:
        return {}
    s = str(x).strip()
    if not s:
        return {}
    # Try JSON first
    try:
        return json.loads(s)
    except Exception:
        pass
    # Then try Python literal (handles single quotes etc.)
    try:
        obj = ast.literal_eval(s)
        if isinstance(obj, dict):
            return obj
        # sometimes it's a stringified dict again
        if isinstance(obj, str):
            try:
                return json.loads(obj)
            except Exception:
                try:
                    return ast.literal_eval(obj)
                except Exception:
                    return {}
        return {}
    except Exception:
        return {}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    s = html.unescape(str(text))
    s = s.lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


# ---- MODEL CALLING FUNCTION ----
def call_wx(prompt, model):
    print('in call wx')

    try:
        generated_response = model.generate_text(prompt=prompt, guardrails=False)
        return generated_response
    except Exception as e:
        print(f"failed to get a response with exception: {e}")
        raise Exception(f"failed to get a response  with exception: {e}")
    


# ---- PROMPT TEMPLATES ----
# ---------------- Prompt templates (your originals) ----------------
def prompt_chrono(context):
    return f"""
Using only the provided context, write a clear summary of the URL's extracted text as a single paragraph:

{context} 

Try to focus the summary on the following areas:
- Key recommendations or solutions, especially those involving AI or automation.
- How these solutions impact business processes such as finance, operations, or customer service.
- Tangible benefits like cost savings, efficiency gains, or improved decision-making.
- Any actionable frameworks, methodologies, or implementation guidance provided.

The goal is to capture core insights and business value in a concise and accessible way.

Summary: 

"""

def prompt_product(context):
    return f"""
Using only the provided context, write a detailed, client-ready summary of the IBM product mentioned using the following information:

{context}. Present the information in paragraph format using plain language.

Your summary should present the information in paragraph format using plain language and cover:
- What the product is, what it does, and how it works.
- Key features, such as natural language processing, integrations, analytics, automation, or customization options.
- Business benefits, including efficiency improvements, cost savings, scalability, or better insights.
- Real-world use cases, particularly in areas like customer service, finance operations, or HR.

Focus on communicating the product’s value clearly to a business audience.

Summary: 

"""

def prompt_research(context):
    return f"""
Using only the company name and context provided below, write a concise and informative company research summary in paragraph format using the following information:

{context}

Include the following:
- Company overview: size, industry, mission, and core services.
- Strategic priorities: focus areas like AI, cloud, digital transformation, or workforce initiatives.
- Recent developments: acquisitions, leadership changes, product launches, or key announcements.
- Culture and leadership: values, executive team, and work environment.
- Financial performance: growth trends, revenue drivers, and business model.
- Competitive positioning: main competitors and differentiation strategies.
- Partnerships or innovation opportunities: technologies adopted or potential alignment with IBM offerings.

This summary should enable personalized, insight-driven outreach by aligning IBM solutions with the company’s goals and challenges.

Summary:

"""

def prompt_comms(context):
    return f"""Write a concise and personalized sales outreach email using only the following information:

{context}

Instructions:
- Thank the client for engaging with the asset (e.g., signing up for a trial, downloading a resource).
- Mention key product features or benefits based on the provided product details.
- Personalize the message using the client's name, title, and company where appropriate.
- Briefly relate the product's value to the company's strategic priorities or tech investments.
- Maintain a professional and friendly tone.
- Include a soft call to action (e.g., schedule a live demo, explore more resources, reach out for help).
- Keep the email concise
- Do not include Subject

Email:

"""

# ---- AGENT CALLER ----
def get_ground_truth(prompt_func, context, model):
    prompt = prompt_func(context)
    ###print("prompt: ", prompt)
    return call_wx(prompt, model)

def clean_output(text):
    # Replace double dashes, extra spaces, escaped newlines
    text = text.replace("-  -", "-").replace("\\n", "\n").replace("  ", " ")
    return text.strip()

def clip_after_best_regards(text):
    keyword = "Best Regards"
    if keyword in text:
        # Find the position of "Best Regards" and keep everything up to the end of that line
        end_index = text.find(keyword) + len(keyword)
        # Optionally include the sender's name if it's on the next line
        lines = text[end_index:].splitlines()
        if lines:
            sender_line = lines[0].strip()
            return text[:end_index] + "\n" + sender_line
        else:
            return text[:end_index]
    return text.strip()

# ---------------- Utilities & speed-ups ----------------
def extract_tool_output(agent_thoughts_text: str):
    m = re.search(r"<b>Agent\(tool_output\)</b> 🤖 : (.*)", agent_thoughts_text or "", re.DOTALL)
    return m.group(1).strip() if m else None

def clip_after_best_regards(text: str):
    if not text:
        return text
    k = "Best Regards"
    i = text.find(k)
    if i == -1:
        return text.strip()
    j = i + len(k)
    lines = text[j:].splitlines()
    return text[:j] + ("\n" + lines[0].strip() if lines else "")

def clean_output(text: str):
    if not text:
        return ""
    return text.replace("-  -", "-").replace("\\n", "\n").replace("  ", " ").strip()

def safe_parse_dict(text_blob):
    if not isinstance(text_blob, str):
        return {}
    try:
        return json.loads(text_blob)
    except Exception:
        try:
            return ast.literal_eval(text_blob)
        except Exception:
            return {}

@lru_cache(maxsize=8)
def get_model_client(model_id: str):
    params = {
        "decoding_method": "greedy",
        "max_new_tokens": 500,
        "min_new_tokens": 0,
        "repetition_penalty": 1,
    }
    return ModelInference(model_id=model_id, params=params, credentials=credentials, project_id=project_id)

def call_wx_retry(prompt: str, model_id: str, retries: int = 4, base_delay: float = 1.0):
    assert isinstance(prompt, str), f"prompt must be str, got {type(prompt)}"
    model = get_model_client(model_id)
    for attempt in range(retries):
        try:
            return model.generate_text(prompt=prompt, guardrails=False)
        except Exception:
            if attempt == retries - 1:
                raise
            sleep(base_delay * (2 ** attempt) + random() * 0.25)

def get_ground_truth(prompt_func, context, model_id="meta-llama/llama-4-maverick-17b-128e-instruct-fp8"):
    prompt = prompt_func(context)
    return call_wx_retry(prompt, model_id)

# ---------------- Judge prompts (wired; no ellipses) ----------------
def llm_judge_eval(eval_type, llm_input, llm_output, ground_truth):
    
    similarity_prompt = f"""Follow these structured steps to accurately assess the similarity between a Golden Text and a Generated Text:
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
    Golden Text: {ground_truth}
    Generated Text: {llm_output}
    
    Output:
    """
    
    rating_prompt = f"""Follow these structured steps to accurately assess the similarity between a Golden Text and a Generated Text:
    1. **Role and Task**: Assume the role of an impartial assistant and evaluator. Your task is to assess the similarity between a Golden Text and a Generated Text using the provided information.
    2. **Initial Setup**: Begin by carefully reviewing the Golden Text to understand the key information, entities, and intents it contains. The Golden Text is considered fully correct and comprehensive. Then, examine the Generated Text that needs evaluation.
    3. **Evaluation Criteria**: Evaluate the Generated Text based on the following criteria:
        - Output {{"Grade": "1"}} if:
          a) The Generated Text is missing critical entities or intents that are present in the Golden Text.
          b) The Generated Text contains significant factual errors or contradictions when compared to the Golden Text.
          c) The overall meaning or intent of the Generated Text substantially differs from the Golden Text.
        - Output {{"Grade": "2"}} if:
          a) The Generated Text somewhat matches the Golden Text in terms of key entities and intents. Note that these may be worded differently but convey the same meaning.
          b) The Generated Text contains part of the essential information from the Golden Text, even if presented in a different order or with slight variations in phrasing.
          c) The Generated Text includes part the core information from the Golden Text and may contain additional relevant details or expansions that don't contradict the original.
        - Output {{"Grade": "3"}} if:
          a) The Generated Text matches the Golden Text closely in terms of key entities and intents. Note that these may be worded differently but convey the same meaning.
          b) The Generated Text contains all the essential information from the Golden Text, even if presented in a different order or with slight variations in phrasing.
          c) The Generated Text includes the core information from the Golden Text and may contain additional relevant details or expansions that don't contradict the original.
    4. **Tolerance for Minor Differences**: Allow for minor differences in numerical values, slight variations in proper nouns, and small discrepancies in less critical details, as long as the core meaning and primary facts remain intact.
    5. **Explanation**: After providing the grade, explain your reasoning in 1 sentence, highlighting key similarities or differences that influenced your decision.
    6. **Output Format**: Format your evaluation output strictly as {{"Grade": "evaluated grade", "Explanation": "explanation for grade"}} to ensure clarity and consistency in assessment.
    Remember, the goal is to identify substantive similarity rather than expecting word-for-word matches. Focus on the core information, key facts, and overall intent when making your assessment.
    
    Input:
    Golden Text: {ground_truth}
    Generated Text: {llm_output}
    
    Output:
    """
    
    comms_prompt = f"""Follow these structured steps to accurately assess the quality of a Generated Email in comparison to a Golden Email, using the provided Context:
    1. **Role and Task**: Assume the role of an impartial evaluator. Your task is to assess how effectively the Generated Email matches the intent, accuracy, and purpose of the Golden Email, based on the provided Context.
    2. **Initial Setup**: Carefully review the **Context**, which provides client interest details, product information, researched company background, and messaging requirements. Then, examine the **Golden Email** (the ideal, high-quality reference). Finally, evaluate the **Generated Email** for how well it follows the intended messaging, factual accuracy, style, and goals.
    3. **Key Term Definitions**:
    - **Faithfulness** = The degree to which the Generated Email is factually accurate, avoids hallucinations, and does not contradict Context or the Golden Email.  
      - Check all named entities (companies, products, people), quantitative claims (percentages, metrics, numbers), qualitative claims (e.g., “market leader”), and relationships (e.g., “X acquired Y”).  
      - Any fabricated or incorrect claim = penalize heavily.  
      - **Do not penalize** for paraphrased or consistent role/product references that match the Context, even if phrased differently.
    - **Context Relevance** = How well the Generated Email uses the provided Context.  
      - High relevance = Uses the most important details, avoids generic filler, and reflects Context priorities.  
      - Low relevance = Uses vague or off-topic details, ignores important Context, or introduces irrelevant points.  
      - **Do not penalize** for paraphrased or inferred alignment if it reflects the client’s actual designation and goals.
    - **Answer Relevance** = How directly the Generated Email addresses the task of the Golden Email (tone, CTA, structure, purpose).  
      - High relevance = Clear alignment with Golden Email’s goal, consistent tone, and logical structure.  
      - Low relevance = Off-topic, confusing, or missing a clear CTA.  
    - **CTA (Call-to-Action)** = The part of the email that tells the recipient what to do next.  
      - Examples: "Schedule a demo," "Download the trial," "Contact us for more info," "Visit this link."  
      - A strong CTA = explicit, actionable, aligned with the Context’s goal.  
      - A weak or missing CTA = vague closing, generic thank-you, or no clear next step.  
      - **Do not penalize placeholder CTAs** (e.g., “[insert time]”, “[Your Name]”, “[insert relevant metrics]”) if the structure and intent are clear.  
    - **Coherence** = Whether the Generated Email reads logically and smoothly (sentence ordering, grammar, transitions).  
    4. **Evaluation Criteria**: Evaluate the Generated Email on a 1–3 scale using the following definitions: 
    - Output {{"Grade": "1"}} if:
        a) **Faithfulness**: Contains major factual errors, hallucinations, or contradictions with the Context or Golden Email.
        b) **Context Relevance**: Largely ignores or misuses the provided Context; feels unrelated or generic.
        c) **Answer Relevance**: Off-topic, confusing, or missing a clear call-to-action (CTA).
    - Output {{"Grade": "2"}} if:
        a) **Faithfulness**: Mostly accurate but includes **some inaccuracies, misleading phrasing, or vague claims** that reduce clarity or precision.
        b) **Context Relevance**: Uses Context only superficially or generically or **omits multiple important details** from the Golden Email.
        c) **Answer Relevance**: Provides a weak or partially effective tone/CTA, **partially fulfilling** the Golden Email’s purpose but not fully persuasive.
    - Output {{"Grade": "3"}} if:
        a) **Faithfulness**: Accurate and reliable, with only **minor harmless differences** (e.g., safe paraphrasing or slight stylistic variation).
        b) **Context Relevance**: Effectively integrates Context and **captures nearly all key details** from the Golden Email.
        c) **Answer Relevance**: Clear, well-structured, and persuasive; **CTA is explicit and effective**, fulfilling the Golden Email’s intent.
    5. **Robustness Checks** (before finalizing the grade):
        - **Factual Robustness**: Would the content remain accurate if lightly rephrased?
        - **Context Robustness**: If context details were removed, would the email still clearly target the same goal?
        - **Coherence Robustness**: Would reordering sentences or using synonyms preserve the intended meaning?
    6. **Tolerance for Minor Differences**: Allow harmless variations in tone, phrasing, or small details as long as meaning, intent, and factual accuracy remain intact.
    7. **Explanation**: After assigning a grade, explain your reasoning in one concise sentence that highlights the key factors influencing your decision.
    8. **Authority & Conflict Resolution**:  
    - Any information present in the Context (especially the Client Interest section) present in the Golden Email should not affect the grade.  
    - IMPORTANT: Penalize invented numbers, percentages, or claims not present in Context.  
    - Do not penalize Generated Emails for including details that exist elsewhere in the Context.
    9. **Calibration Rule**:  
    - If the Generated Email has **any major hallucinations or errors**, assign Grade 1.  
    - If the Generated Email is **largely correct and aligned**, even with minor flaws, assign Grade 3.  
    10. **Output Format**: Return your evaluation strictly in the following format:
        {{
            "Grade": "evaluated grade",
            "Explanation": "brief explanation for the grade"
        }}
    
    Important: Do NOT output explanations, reasoning steps, or markdown. 
    Your ENTIRE reply must be a single JSON object matching the format exactly.
    
    Focus on factual accuracy, relevance to the Context, and alignment with the Golden Email’s purpose, rather than exact style-matching.
    
    Input:Golden Email: {ground_truth}
    Context: {llm_input}
    Generated Email: {llm_output}
    
    Output: 
    """
    
    if eval_type == "comms":
        prompt = comms_prompt
    elif eval_type in ("chrono", "research"):
        prompt = similarity_prompt
    elif eval_type == "product":
        # Decision to leverage the same RAG similarity prompt for Product Agent as well
        #prompt = rating_prompt
        prompt = similarity_prompt
    else:
        raise ValueError(f"Unknown eval_type: {eval_type}")
    judge_id = "mistralai/mistral-medium-2505"
    resp = call_wx_retry(prompt, judge_id)
    if "```json\n" in resp:
        resp = resp.replace("```json\n", "").replace("```", "").strip()
    return resp.strip()

def evaluate_all(eval_type, llm_input, llm_output, ground_truth):
    print(f"Running LLM-as-a-judge evaluation for {eval_type}...")
    return {"llm_scores": llm_judge_eval(eval_type, llm_input, llm_output, ground_truth)}


def cleanup_results(inresults):
    matches = re.findall(r'\{([^}]+)\}', inresults)
    entry = matches[0]
    entry2="{"+entry+"}"
    outresults = json.loads(entry2)
    return outresults


def normkey(s: str) -> str:
    return s.lower().replace(" ", "").replace("_","").replace("-", "")

def resolve_col(df, candidates):
    norm = {normkey(c): c for c in df.columns}
    for cand in candidates:
        ck = normkey(cand)
        if ck in norm:
            return norm[ck]
    return None

def pick_best_sheet(xlsx_path: str, required_any):
    xl = pd.ExcelFile(xlsx_path)
    best_name, best_score = xl.sheet_names[0], -1
    for name in xl.sheet_names:
        tmp = xl.parse(sheet_name=name, nrows=1)
        score = sum(resolve_col(tmp, [r]) is not None for r in required_any)
        if score > best_score:
            best_name, best_score = name, score
    return best_name

# ---------------- Build Context (only if missing) ----------------
def build_context_row(sr: pd.Series) -> str:
    pieces = []
    def add(label, *keys):
        for k in keys:
            if k in sr and pd.notna(sr[k]) and str(sr[k]).strip():
                pieces.append(f"{label}: {sr[k]}")
                break
    add("Company", "company","account_name")
    add("Contact", "contact","contact_form_name")
    add("Title", "title","lead")
    add("Lead Note", "leadnote","lead_description")
    add("Asset", "asset_name")
    add("Asset URL", "asset_url","ci_item_url")
    add("Campaign", "campaign_name")
    add("Market", "ibm_market","ibm_sales_channel")
    add("Country", "country")
    add("Industry", "industry")
    add("CI Timestamp", "ci_ts","lastmodifieddate","createddate")
    return "\n".join(pieces).strip()

# ---------------- Per-row processing (concurrent LLM) ----------------
def process_row(row):
    context = str(row.Context)

    d_prod = safe_parse_dict(getattr(row, "Product_Agent_Output", ""))
    d_res  = safe_parse_dict(getattr(row, "Research_Agent_Output", ""))
    d_chr  = safe_parse_dict(getattr(row, "Chrono_Agent_output", ""))
    d_com  = safe_parse_dict(getattr(row, "Comms_Agent_Output", ""))

    product_tool_output  = d_prod.get("metadata.iterations.1.tool_output", "ERROR: No Output")
    research_tool_output = d_res.get("metadata.iterations.1.tool_output", "ERROR: No Output")
    chrono_tool_output   = d_chr.get("metadata.iterations.1.tool_output", "ERROR: No Output")

    product_output  = d_prod.get("output.value", "")
    research_output = d_res.get("output.value", "")
    chrono_output   = d_chr.get("output.value", "")

    comms_output = d_com.get("output.value", "")
    comms_input  = d_com.get("input.value", "")

#    llm_input = (
#        "AUTHORITATIVE CONTEXT (from asset/page):\n" + (chrono_output or "") +
#        "\n\nSUPPORTING RESEARCH:\n" + (research_output or "") +
#        "\n\nPRODUCT DETAILS:\n" + (product_output or "") +
#        "\n\nEMAIL GENERATION PROMPT:\n" + (comms_input or "") +
#        "\n\nClient Interest Information (highest authority):\n" + context
#    )

    llm_input = (
        "AUTHORITATIVE CONTEXT (from asset/page):\n" + (chrono_output or "") +
        "\n\nSUPPORTING RESEARCH:\n" + (research_output or "") +
        "\n\nPRODUCT DETAILS:\n" + (product_output or "") +
        "\n\nClient Interest Information (highest authority):\n" + context
    )

    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        f_prod = ex.submit(get_ground_truth, prompt_product,  context + product_tool_output)
        f_res  = ex.submit(get_ground_truth, prompt_research, context + research_tool_output)
        f_chr  = ex.submit(get_ground_truth, prompt_chrono,   context + chrono_tool_output)
        f_com  = ex.submit(get_ground_truth, prompt_comms,    context + research_output + product_output + chrono_output)

        product_gt  = clean_output(f_prod.result())
        research_gt = clean_output(f_res.result())
        chrono_gt   = clean_output(f_chr.result())
        comms_gt    = clip_after_best_regards(clean_output(f_com.result()))

    with cf.ThreadPoolExecutor(max_workers=4) as ex2:
        f_c = ex2.submit(evaluate_all, "comms",   llm_input, comms_output,   comms_gt)
        f_p = ex2.submit(evaluate_all, "product", "",        product_output, product_gt)
        f_r = ex2.submit(evaluate_all, "research","",        research_output,research_gt)
        f_h = ex2.submit(evaluate_all, "chrono",  "",        chrono_output,  chrono_gt)
        return (
            chrono_gt, research_gt, product_gt, comms_gt,
            f_h.result(), f_r.result(), f_p.result(), f_c.result()
        )


def process_csv_fast(json_data, creds, projectID, num_records=None, max_workers_rows=4):
    global credentials
    global project_id

    credentials = creds
    project_id = projectID

    # Pick best sheet (works even if there are multiple)
    required_any = [
        "Context","Product Agent Output","Research Agent Output","Chrono Agent output","Comms Agent Output",
        "status","Status"
    ]
    ##sheet = pick_best_sheet(file_path, required_any)
    ##print(f"Using sheet: {sheet}")

    ###df_all = pd.read_excel(file_path, sheet_name=sheet)

    df_all = pd.read_json(json_data)
    total_record = len(df_all)
    print("total records to be processed: ", total_record)

    # Show a quick diagnostic to confirm correct schema
    print("First 12 cols:", list(df_all.columns)[:12])

    # Handle Status/status
    status_col = resolve_col(df_all, ["Status","status"])
    if status_col:
        mask_completed = df_all[status_col].astype(str).str.lower() == "completed"
        df = df_all[mask_completed].copy()
    else:
        df = df_all.copy()

    
    if num_records:
        df = df.head(num_records)

    # Resolve expected columns (case/space/underscore flexible)
    col_product  = resolve_col(df, ["Product Agent Output","Product_Agent_Output"])
    col_research = resolve_col(df, ["Research Agent Output","Research_Agent_Output"])
    col_chrono   = resolve_col(df, ["Chrono Agent output","Chrono_Agent_output","Chrono Agent Output"])
    col_comms    = resolve_col(df, ["Comms Agent Output","Comms_Agent_Output"])
    col_context  = resolve_col(df, ["Context"])

    # If Context missing, build one from raw CI fields
    if col_context is None:
        print("No 'Context' column found; building Context from available CI fields…")
        df["__ctx__"] = df.apply(lambda r: build_context_row(r), axis=1)
        col_context = "__ctx__"

    # Rename to normalized names for itertuples
    renames = {col_context: "Context"}
    if col_product:  renames[col_product]  = "Product_Agent_Output"
    if col_research: renames[col_research] = "Research_Agent_Output"
    if col_chrono:   renames[col_chrono]   = "Chrono_Agent_output"
    if col_comms:    renames[col_comms]    = "Comms_Agent_Output"
    if status_col:   renames[status_col]   = "Status"
    df = df.rename(columns=renames)

    # Ensure agent columns exist (create empty if absent)
    for c in ["Product_Agent_Output","Research_Agent_Output","Chrono_Agent_output","Comms_Agent_Output"]:
        if c not in df.columns:
            df[c] = ""

    keep = ["Context","Product_Agent_Output","Research_Agent_Output","Chrono_Agent_output","Comms_Agent_Output"]
    if "UniqueID" in df.columns: keep = ["UniqueID"] + keep
    if "Status" in df.columns:   keep = keep + ["Status"]
    df = df[keep].copy()

    results = []
    print("calling process row to handle multiple CI records in parallel")
    with cf.ThreadPoolExecutor(max_workers=max_workers_rows) as pool:
        futures = [pool.submit(process_row, row) for row in df.itertuples(index=False)]
        #for row in df.itertuples(index=False):
        #    print("CI ID: ", row.UniqueID)
        #    #print("processing row: ", row)
        #    futures = [pool.submit(process_row, row)]

        for fut in cf.as_completed(futures):
            try:
                results.append(fut.result())
            except Exception as e:
                results.append(("", "", "", "",
                                {"llm_scores": ""}, {"llm_scores": ""}, {"llm_scores": ""}, {"llm_scores": ""}))
                print(f"exception in calling process row with error {e}")

    if not results:
        for col in [
            "Expected_Chrono_Output_(Ground_Truth)",
            "Expected_Research_Output_(Ground_Truth)",
            "Expected_Product_Output_(Ground_Truth)",
            "Expected_Comms_Output_(Ground_Truth)",
            "Chrono_Score","Research_Score","Product_Score","Comms_Score"
        ]:
            df[col] = []
        return df

#    print("calling cols list zip")
#    cols = list(zip(*results))
    cols = list(itertools.zip_longest(*results, fillvalue=''))
    
    df["Expected_Chrono_Output_(Ground_Truth)"]   = cols[0]
    df["Expected_Research_Output_(Ground_Truth)"] = cols[1]
    df["Expected_Product_Output_(Ground_Truth)"]  = cols[2]
    df["Expected_Comms_Output_(Ground_Truth)"]    = cols[3]
    df["Chrono_Score"]   = cols[4]
    df["Research_Score"] = cols[5]
    df["Product_Score"]  = cols[6]
    df["Comms_Score"]    = cols[7]

    return df

def extract_user_query(query_number, input_text):
    pattern = rf"User Query {query_number}:\s*(.*?)(?=\n|$)"
    match = re.search(pattern, input_text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None
