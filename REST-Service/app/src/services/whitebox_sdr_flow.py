import re
import html
import json
import ast
import pandas as pd
from fuzzywuzzy import fuzz

## Whitebox evaluation (trace-based evaluation) for SDR+ workflow
## Based on latest file format ("langfuse output")
## expects input excel file with the columns: "Chrono Agent output", "Product Agent Output", "Research Agent Output", "Comms Agent Output"

## Tool names and flow specific to custom agent arch. of SDR flow
## workflow and seqs checked as per this flow


CATEGORY_TOOLS = {
    ## "Get CI": ["get_ci_queue", "get_ci_high_priority", "get_ci_by_client_name", "get_ci_by_id"], # (unused in latest langfuse/custom agent sdr flow)
    "Parse the asset URL and summarize its content": ["parse_and_summarize_tool"],
    "Fetch more details about the Product": ["product_details_tool"],
    "Perform research on the company": ["company_research_tool"],
    "Draft email": ["draft_email_tool"],
}

## Since data provided is already categorized into specific agents, no need for category identification
## agent 1 - Chrono, 2 - Product, 3 - Research, 4 - Comms
CATEGORY_SIGNALS = {
    1: "Parse the asset URL and summarize its content",
    2: "Fetch more details about the Product",
    3: "Perform research on the company",
    4: "Draft email"
}


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

def preprocess_string(s):
    # Remove markdown headers and excessive whitespace
    s = re.sub(r"##*\s*", " ", s)
    s = re.sub(r"\s+", " ", s) 
    return s.strip().lower()


def extract_tools_from_trail(trail: dict):
    """
    Extract tools **only** from keys like:
      metadata.steps.<n>.tool.name
    Match against known tools so we ignore noise.
    """

    if not isinstance(trail, dict):
        return []

    known_tools = {t for tools in CATEGORY_TOOLS.values() for t in tools}

    tools_found = []
    tool_key_re = re.compile(r"^metadata\.steps\.\d+\.tool.name$")
    for k, v in trail.items():
        if tool_key_re.match(str(k)):
            s = str(v)

            for t in known_tools:
                if t in s:
                    tools_found.append(t)

    if not tools_found:
        blob = " ".join([f"{k}:{v}" for k, v in trail.items()])
        for t in known_tools:
            if t in blob:
                tools_found.append(t)

    seen = set()
    ordered = []
    for t in tools_found:
        if t not in seen:
            ordered.append(t)
            seen.add(t)
    return ordered


def check_flow_validity(trail: dict) -> bool:
    ## tool usage is checked by other functions

    required_key_values = {
        "metadata.steps.1.tool.name": "think",
        "metadata.steps.2.tool.name": "final_answer"
    }

    for key, expected_value in required_key_values.items():
        if key not in trail or trail[key] != expected_value:
            return False

    return True


def fuzzy_match(a, b, threshold=84):
    """Return True if similarity is >= threshold"""

    a_str = str(a).strip().lower()
    b_str = str(b).strip().lower()

    a_pr_str = preprocess_string(a_str)
    b_pr_str = preprocess_string(b_str)

    score = fuzz.token_set_ratio(a_pr_str, b_pr_str)
    return score >= threshold


def extract_and_compare(data):
    info = {}
    sections = ["Client Interest Details", "Asset Summary", "Product Information", "Product Details", "Company Research"]

    for section in sections:
        # Lookahead for any other section name as the boundary
        lookahead = '|'.join(s for s in sections if s != section)
        pattern = rf"{section}:\s*(.*?)(?={lookahead}:|$)"
        match = re.search(pattern, data, re.DOTALL)
        if match:
            # Unescape HTML and backslash-escaped quotes
            content = match.group(1).strip()
            content = content.replace('\\"', '"')
            content = content.replace('{',"").replace('}',"")
            content = html.unescape(content)
            info[section] = content

    return info

def wboxevaluate_sdr(trail: dict, agent: int):

    # agent: 1 - Chrono, 2 - Product, 3 - Research, 4 - Comms

    expected_tools = CATEGORY_TOOLS[CATEGORY_SIGNALS[agent]]
    called_tools = extract_tools_from_trail(trail)

    were_tools_called = len(called_tools) > 0

    were_required_tools_called = all(tool in called_tools for tool in expected_tools) if expected_tools else False

    valid_flow = check_flow_validity(trail)

    score = 1 if (were_tools_called, were_required_tools_called, valid_flow).count(True) == 3 else 0

    # print("SCORE: ", score)

    return {
        "score": score,
        "details": {
            "expected_tools": expected_tools,
            "were tools called": were_tools_called,
            "what tools were called": called_tools,
            "were required tools called": were_required_tools_called,
            "valid_flow": valid_flow,
        }
    }