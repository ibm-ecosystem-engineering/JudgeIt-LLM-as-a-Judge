import json
from dotenv import load_dotenv
import pandas as pd
from app.src.services.answer_similarity import build_query_similarity_prompt
from app.src.services.answer_rating import build_query_rating_prompt
from app.src.services.single_turn_eval import build_single_turn_prompt
from app.src.services.mult_turn_with_conversation_eval import build_multi_turn_prompt
from app.src.services.WatsonXService import WatsonXService
from app.src.services.negativetest_eval import negative_testing
from app.src.services.whitebox_sdr_flow import wboxevaluate_sdr, safe_parse_agent_output, extract_and_compare, fuzzy_match
from app.src.services.blackbox_sdr_flow import process_csv_fast


from celery import Celery
import time
import os

load_dotenv()

celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND")

### Environmental variables
IBM_CLOUD_API_KEY = os.environ.get("IBM_CLOUD_API_KEY")
WX_PROJECT_ID = os.environ.get("WX_PROJECT_ID")
WX_URL = os.environ.get("WATSONX_URL")
wx_platform: str  = os.environ.get("WX_PLATFORM")
wx_user_onpremise = os.environ.get("WX_USER")

grade_col_name = "judgeit_score"
explanation_col_name = "judgeit_reasoning"
@celery.task(bind=True, name="rating_batch_task")
def rating_batch_task(self, json_data, model_id="meta-llama/llama-3-70b-instruct"):

    try:
        ## Create langchain watsonx LLM service
        watsonx_service = WatsonXService(
                api_key=IBM_CLOUD_API_KEY,
                project_id=WX_PROJECT_ID,
                llm_model_id=model_id
            )
        
        llm_model = watsonx_service.get_wml_llm_services()

        data_df=pd.read_json(json_data)
        tatal_record = len(data_df)
        
        # Iterate over each row in the DataFrame
        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': tatal_record})

            prompt, prompt_data = build_query_rating_prompt(row)
            llm_chain = prompt | llm_model

            prompt_results={
                "Grade": None,
                "Explanation": None
            }

            try:
                prompt_results = json.loads(llm_chain.invoke(prompt_data))
            except Exception as e:
                print(f"error in generating ratings, {str(e)}")
        
            data_df.loc[index,grade_col_name] = prompt_results["Grade"]

            if 'Explanation' in prompt_results:
                data_df.loc[index,explanation_col_name] = prompt_results["Explanation"]
            else:
                data_df.loc[index,explanation_col_name] = None

        #self.update_state(state='SUCCESS', meta={'current': tatal_record, 'total': tatal_record})
        return data_df.to_json()
    except Exception as e:
        self.update_state(state='ERROR', meta={'current': None, 'total': tatal_record})
        
        print(str(e))
        return {
            "status": "ERROR",
            "msg": "error in processing multi-turn batch request"
        }
    
@celery.task(bind=True, name="similarity_batch_task")
def similarity_batch_task(self, json_data, model_id="meta-llama/llama-3-70b-instruct"):

    try:
        ## Create langchain watsonx LLM service
        watsonx_service = WatsonXService(
                api_key=IBM_CLOUD_API_KEY,
                project_id=WX_PROJECT_ID,
                llm_model_id=model_id
            )
        
        llm_model = watsonx_service.get_wml_llm_services()

        data_df=pd.read_json(json_data)
        tatal_record = len(data_df)
        
        # Iterate over each row in the DataFrame
        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': tatal_record})

            prompt, prompt_data = build_query_similarity_prompt(row)
            llm_chain = prompt | llm_model

            prompt_results={
                "Grade": None,
                "Explanation": None
            }

            try:
                prompt_results = json.loads(llm_chain.invoke(prompt_data))
            except Exception as e:
                print(f"error in generating ratings, {str(e)}")
            
            data_df.loc[index,grade_col_name] = prompt_results["Grade"]

            if 'Explanation' in prompt_results:
                data_df.loc[index,explanation_col_name] = prompt_results["Explanation"]
            else:
                data_df.loc[index,explanation_col_name] = None
                
        return data_df.to_json()
    except Exception as e:
        self.update_state(state='ERROR', meta={'current': None, 'total': tatal_record})
        return {
            "status": "ERROR",
            "msg": "error in processing multi-turn batch request"
        }
    

@celery.task(bind=True, name="multi_turn_batch_task")
def single_turn_batch_task(self, json_data, model_id="meta-llama/llama-3-70b-instruct"):
    try:
        ## Create langchain watsonx LLM service
        watsonx_service = WatsonXService(
                api_key=IBM_CLOUD_API_KEY,
                project_id=WX_PROJECT_ID,
                llm_model_id=model_id
            )
        
        llm_model = watsonx_service.get_wml_llm_services()
        
        data_df=pd.read_json(json_data)
        tatal_record = len(data_df)

        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': tatal_record})

            prompt, prompt_data = build_single_turn_prompt(row)
            llm_chain = prompt | llm_model
            prompt_results = None
            try:
                prompt_results = json.loads(llm_chain.invoke(prompt_data))['Grade']
            except:
                prompt_results = 'Error generating grade'
            # Update the DataFrame with the extracted values
            data_df.loc[index,grade_col_name] = prompt_results

        return data_df.to_json()
        
    except:
        self.update_state(state='ERROR', meta={'current': None, 'total': tatal_record})
        return {
            "status": "ERROR",
            "msg": "error in processing single-turn batch request"
        }

@celery.task(bind=True, name="multi_turn_with_conversation_batch_task")
def multi_turn_with_conversation_batch_task(self, json_data, model_id="meta-llama/llama-3-70b-instruct"):
    try:
        ## Create langchain watsonx LLM service
        watsonx_service = WatsonXService(
                api_key=IBM_CLOUD_API_KEY,
                project_id=WX_PROJECT_ID,
                llm_model_id=model_id
            )
        
        llm_model = watsonx_service.get_wml_llm_services()
        
        data_df=pd.read_json(json_data)
        tatal_record = len(data_df)

        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': tatal_record})

            prompt, prompt_data = build_multi_turn_prompt(row)
            llm_chain = prompt | llm_model
            prompt_results = None
            try:
                prompt_results = json.loads(llm_chain.invoke(prompt_data))['Grade']
            except:
                prompt_results = 'Error generating grade'
            # Update the DataFrame with the extracted values
            data_df.loc[index,grade_col_name] = prompt_results

        return data_df.to_json()
        
    except:
        self.update_state(state='ERROR', meta={'current': None, 'total': tatal_record})
        return {
            "status": "ERROR",
            "msg": "error in processing multi-turn with conversation batch request"
        }

@celery.task(bind=True, name="negative_test_eval_sdrflow_batch_task")
def negative_testing_sdrflow_batch_task(self, json_data, model_id="meta-llama/llama-3-3-70b-instruct"):
    try:
        data_df = pd.read_json(json_data)
        total_records = len(data_df)

        agents = ["Research", "Comms"]

        # Define score categories
        categories = {
            "HAP": "(grade)",
            "HARM": "(harm-grade)",
            "LLMJ": "LLM-as-judge(grade)",
            "Profanity": "(profanity-grade)",
            "Evasiveness": "(evasiveness-grade)",
            "SocialBias": "(social-bias-grade)",
            "JailBreak": "(jailbreak-grade)",
            "SexualContent": "(sexualcontent-grade)",
            "UnethicalBehavior": "(unethical behavior-grade)",
            "Violence": "(violence-grade)",
        }

        # Initialize result storage
        results = {f"{agent}_{cat}Grade": [] for agent in agents for cat in categories}
        results.update({
            "Research_HAPGrade_ng_display": [],
            "Comms_HAPGrade_ng_display": [],
            "Research_HARMGrade_ng_display": [],
            "Comms_HARMGrade_ng_display": [],
        })

        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state="PROGRESS", meta={"current": index, "total": total_records})

            try:
                row_scores = negative_testing(row, agents)
            except Exception as e:
                raise Exception(f"negative_testing failed on row {index}: {e}")

            for cat, suffix in categories.items():
                for agent in agents:
                    key = f"{agent} {suffix}"
                    score = row_scores[key]
                    
                    if score is None:
                        score = 0

                    results[f"{agent}_{cat}Grade"].append(score)

                    # Special display values for HAP & HARM
                    if cat in ["HAP", "HARM"]:
                        ng_key = f"{agent}_{cat}Grade_ng_display"
                        results[ng_key].append(1 if score >= 0.1 else 0)

        for col, values in results.items():
            data_df[col] = values

        return data_df.to_json()

    except Exception as e:
        error_message = str(e)
        self.update_state(state='ERROR', meta={'current': None, 'total': total_records, 'error': error_message})
        return {
            "status": "ERROR",
            "msg": f"error in processing negative testing sdrflow batch request: {error_message}",
        }


@celery.task(bind=True, name="whitebox_eval_sdrflow_batch_task")
def wbox_sdrflow_batch_task(self, json_data, model_id="meta-llama/llama-3-3-70b-instruct"):

    try:
        data_df = pd.read_json(json_data)
        total_record = len(data_df)

        workflow_scores = []
        chrono_results = []
        product_results = []
        research_results = []
        comms_results = []

        for index, row in data_df.iterrows():
            print(index)
            self.update_state(state='PROGRESS', meta={'current': index, 'total': total_record})

            chrono_trail = safe_parse_agent_output(row.get("Chrono Agent output", {}))
            product_trail = safe_parse_agent_output(row.get("Product Agent Output", {}))
            research_trail = safe_parse_agent_output(row.get("Research Agent Output", {}))
            comms_trail = safe_parse_agent_output(row.get("Comms Agent Output", {}))

            chrono_result = wboxevaluate_sdr(chrono_trail, 1)
            product_result = wboxevaluate_sdr(product_trail, 2)
            research_result = wboxevaluate_sdr(research_trail, 3)
            comms_result = wboxevaluate_sdr(comms_trail, 4)

            chrono_results.append(chrono_result)
            product_results.append(product_result)
            research_results.append(research_result)
            comms_results.append(comms_result)

            try:
                tool_input = comms_trail["metadata.steps.0.input.input_data"]
            except KeyError:
                workflow_scores.append(0)
                continue

            extracted = extract_and_compare(tool_input)
            if not extracted:
                workflow_scores.append(0)
                continue
            
            # Get expected values
            context_value = row.get("Context", "")
            chrono_value = chrono_trail.get("output.value", {})
            product_value = product_trail.get("output.value", {})
            research_value = research_trail.get("output.value", {})

            # Fuzzy compare with debug
            ci_match = fuzzy_match(extracted.get("Client Interest Details", ""), context_value)
            asset_match = fuzzy_match(extracted.get("Asset Summary", ""), chrono_value)
            company_match = fuzzy_match(extracted.get("Company Research", ""), research_value)
            product_match = fuzzy_match((extracted.get("Product Information", "") or extracted.get("Product Details", "")), product_value) 

            score = 1 if all([ci_match, asset_match, company_match, product_match]) else 0
            workflow_scores.append(score)


        # Add results to dataframe
        data_df["Chrono result"] = chrono_results
        data_df["Product result"] = product_results
        data_df["Research result"] = research_results
        data_df["Comms result"] = comms_results
        data_df["workflow score"] = workflow_scores
        
        try:
            data_df["workflow wboxGrade"] = workflow_scores
        except Exception as e:
            print(f"error when setting grades for workflow with error: {e}")
            
        return data_df.to_json()    

    except Exception as e:
        self.update_state(state='ERROR', meta={'current': None, 'total': total_record})
        return {
            "status": "ERROR",
            "msg": "error in processing whitebox sdrflow batch request"
        }    


@celery.task(bind=True, name="blackbox_eval_sdrflow_batch_task")
def bbox_sdrflow_batch_task(self, json_data, model_id="meta-llama/llama-3-3-70b-instruct"):

    print("model is is: ", model_id)
    try:
        data_df = pd.read_json(json_data)
        total_record = len(data_df)

        print("total records: ", total_record)
        # Define agent configurations
        agents = {
            "Chrono": {
                "column": "Chrono Agent Output",
                "query_num": 1
            },
            "Product": {
                "column": "Product Agent Output",
                "query_num": 2
            },
            "Research": {
                "column": "Research Agent Output",
                "query_num": 3
            },
            "Comms": {
                "column": "Comms Agent Output",
                "query_num": 4
            }
        }

        # Initialize storage for scores and details
        results = {
            agent: {
                "grades": [],
                "details": []
            } for agent in agents
        }

        # watsonx.ai runtime credentials
        wxai_url=WX_URL
        wxai_apikey=IBM_CLOUD_API_KEY

        print("wx ai url: ", wxai_url)
        print("wx apikey: ", wxai_apikey)

#        credentials = {
#            "url": wxai_url,
#            "apikey": wxai_apikey
#        }
#        project_id=WX_PROJECT_ID
#        model_id=MODEL_ID
#        print("project id: ", project_id)
#        print("model_id: ", model_id)

        credentials = {
            "url": wxai_url,
            "apikey": wxai_apikey
        }

        parameters = {
           "decoding_method": "greedy",
            "max_new_tokens": 500,
            "min_new_tokens": 0,
            "repetition_penalty": 1
        }

        #model = ModelInference(
        #    model_id=model_id,
        #    params=parameters,
        #    credentials=credentials,
        #    project_id=WX_PROJECT_ID
        #)

        try:
            fastDF = process_csv_fast(json_data, creds=credentials, projectID=WX_PROJECT_ID, num_records=None, max_workers_rows=4)
            
            #fastDF.to_csv("/tmp/t1.csv",index=False)
            #print("fastDF returned, num rows: ", len(fastDF))
            #print("columns of fastDF: ", fastDF.columns.tolist())
            try:
                chrono_list = fastDF["Chrono_Score"].tolist()

                for json_obj in chrono_list:
                    nested_json = json.loads(json_obj['llm_scores'])
                    chrono_grades = nested_json['Grade']
                    chrono_explanation = nested_json['Explanation']
                    #print("chrono grades: ", chrono_grades)
                    #print("chrono explanation: ", chrono_explanation)
                    results["Chrono"]["grades"].append(chrono_grades)
                    results["Chrono"]["details"].append(chrono_explanation) 
                    #print("appended chrono scores ", fastDF["Chrono_Score"].tolist())
            except Exception as e:
                print(f"error extracting chrono details from DF: {e}")

            try:
                product_list = fastDF["Product_Score"].tolist()
                #print("num elements in product list: ", len(product_list))
                #i=1
                for json_obj in product_list:
                    #print("index: ", i)
                    #print("json obj: ", json_obj)
                    nested_json = json.loads(json_obj['llm_scores'])
                    product_grades = nested_json['Grade']
                    product_explanation = nested_json['Explanation']
                    #i = i+1
                    #print("product grades: ", product_grades)
                    #print("product explanation: ", product_explanation)
                    results["Product"]["grades"].append(product_grades)
                    results["Product"]["details"].append(product_explanation) 
                    #print("appended product scores")
            except Exception as e:
                print(f"error extracting product details from DF: {e}")

            try:
                research_list = fastDF["Research_Score"].tolist()
                for json_obj in research_list:
                    nested_json = json.loads(json_obj['llm_scores'])
                    research_grades = nested_json['Grade']
                    research_explanation = nested_json['Explanation']
                    #print("research grades: ", research_grades)
                    #print("research explanation: ", research_explanation)
                    results["Research"]["grades"].append(research_grades)
                    results["Research"]["details"].append(research_explanation) 
            except Exception as e:
                print(f"error extracting research details from DF: {e}")

            try:
                comms_list = fastDF["Comms_Score"].tolist()
                for json_obj in comms_list:
                    nested_json = json.loads(json_obj['llm_scores'])
                    comms_grades = nested_json['Grade']
                    comms_explanation = nested_json['Explanation']
                    #print("comms grades: ", comms_grades)
                    #print("comms explanation: ", comms_explanation)
                    results["Comms"]["grades"].append(comms_grades)
                    results["Comms"]["details"].append(comms_explanation) 
            except Exception as e:
                print(f"error extracting comms details from DF: {e}")


        except Exception as e:
            print(f"BlackBox Evaluation failed with exception: {e}")


        # Add results to dataframe
        for agent_name, data in results.items():
            try:
                data_df[f"{agent_name} bboxGrade"] = data["grades"]
                data_df[f"{agent_name} bboxdetails"] = data["details"]

                #grade = data_df[f"{agent_name} bboxGrade"]
                #details = data_df[f"{agent_name} bboxdetails"]
                #print(f"setting grade for {agent_name} as {grade}")
                #print(f"setting explanation for {agent_name} as {details}")
            except Exception as e:
                print(f"error when setting grades for {agent_name} with error: {e}")
            

        return data_df.to_json()    

    except Exception as e:
        self.update_state(state='ERROR', meta={'current': None, 'total': total_record})
        return {
            "status": "ERROR",
            "msg": "error in processing blackbox sdrflow batch request"
        }    


@celery.task(bind=True, name="agent_eval_sdrflow_batch_task")
def agent_sdrflow_batch_task(self, json_data, model_id="meta-llama/llama-3-3-70b-instruct"):

    print("model is is: ", model_id)
    try:
        data_df = pd.read_json(json_data)
        total_record = len(data_df)

        print("total records: ", total_record)
    
        # Define agent configurations
        agents = {
            "Chrono": {
                "column": "Chrono Agent Output",
                "query_num": 1
            },
            "Product": {
                "column": "Product Agent Output",
                "query_num": 2
            },
            "Research": {
                "column": "Research Agent Output",
                "query_num": 3
            },
            "Comms": {
                "column": "Comms Agent Output",
                "query_num": 4
            }
        }

        # Initialize storage for scores and details
        results = {
            agent: {
                "grades": [],
                "details": []
            } for agent in agents
        }

        # watsonx.ai runtime credentials
        wxai_url=WX_URL
        wxai_apikey=IBM_CLOUD_API_KEY

        credentials = {
            "url": wxai_url,
            "apikey": wxai_apikey
        }


        try:
            fastDF = process_csv_fast(json_data, creds=credentials, projectID=WX_PROJECT_ID, num_records=None, max_workers_rows=4)
                
            try:
                chrono_list = fastDF["Chrono_Score"].tolist()

                for json_obj in chrono_list:
                    nested_json = json.loads(json_obj['llm_scores'])
                    chrono_grades = nested_json['Grade']
                    chrono_explanation = nested_json['Explanation']
                    results["Chrono"]["grades"].append(chrono_grades)
                    results["Chrono"]["details"].append(chrono_explanation) 
            except Exception as e:
                print(f"error extracting chrono details from DF: {e}")

            try:
                product_list = fastDF["Product_Score"].tolist()
                for json_obj in product_list:
                    nested_json = json.loads(json_obj['llm_scores'])
                    product_grades = nested_json['Grade']
                    product_explanation = nested_json['Explanation']
                    results["Product"]["grades"].append(product_grades)
                    results["Product"]["details"].append(product_explanation) 
            except Exception as e:
                print(f"error extracting product details from DF: {e}")

            try:
                research_list = fastDF["Research_Score"].tolist()
                for json_obj in research_list:
                    nested_json = json.loads(json_obj['llm_scores'])
                    research_grades = nested_json['Grade']
                    research_explanation = nested_json['Explanation']
                    results["Research"]["grades"].append(research_grades)
                    results["Research"]["details"].append(research_explanation) 
            except Exception as e:
                print(f"error extracting research details from DF: {e}")

            try:
                comms_list = fastDF["Comms_Score"].tolist()
                for json_obj in comms_list:
                    nested_json = json.loads(json_obj['llm_scores'])
                    comms_grades = nested_json['Grade']
                    comms_explanation = nested_json['Explanation']
                    results["Comms"]["grades"].append(comms_grades)
                    results["Comms"]["details"].append(comms_explanation) 
            except Exception as e:
                print(f"error extracting comms details from DF: {e}")


        except Exception as e:
            print(f"BlackBox Evaluation failed with exception: {e}")


        # Add results to dataframe
        for agent_name, data in results.items():
            try:
                data_df[f"{agent_name} bboxGrade"] = data["grades"]
                data_df[f"{agent_name} bboxdetails"] = data["details"]

            except Exception as e:
                print(f"error when setting grades for {agent_name} with error: {e}")   

        # Whitebox Eval
        workflow_scores = []
        chrono_results = []
        product_results = []
        research_results = []
        comms_results = []
        for index, row in data_df.iterrows():
            #print(f"processing CI: {row.get("UniqueID")}")
            self.update_state(state='PROGRESS', meta={'current': index, 'total': total_record})

            chrono_trail = safe_parse_agent_output(row.get("Chrono Agent Output", {}))
            product_trail = safe_parse_agent_output(row.get("Product Agent Output", {}))
            research_trail = safe_parse_agent_output(row.get("Research Agent Output", {}))
            comms_trail = safe_parse_agent_output(row.get("Comms Agent Output", {}))

            chrono_result = wboxevaluate_sdr(chrono_trail, 1)
            product_result = wboxevaluate_sdr(product_trail, 2)
            research_result = wboxevaluate_sdr(research_trail, 3)
            comms_result = wboxevaluate_sdr(comms_trail, 4)

            chrono_results.append(chrono_result)
            product_results.append(product_result)
            research_results.append(research_result)
            comms_results.append(comms_result)

            try:
                tool_input = comms_trail["metadata.steps.0.input.input_data"]
            except KeyError:
                workflow_scores.append(0)
                continue

            extracted = extract_and_compare(tool_input)
            if not extracted:
                workflow_scores.append(0)
                continue
            
            # Get expected values
            context_value = row.get("Context", "")
            chrono_value = chrono_trail.get("output.value", {})
            product_value = product_trail.get("output.value", {})
            research_value = research_trail.get("output.value", {})

            # Fuzzy compare with debug
            ci_match = fuzzy_match(extracted.get("Client Interest Details", ""), context_value)
            asset_match = fuzzy_match(extracted.get("Asset Summary", ""), chrono_value)
            company_match = fuzzy_match(extracted.get("Company Research", ""), research_value)
            product_match = fuzzy_match((extracted.get("Product Information", "") or extracted.get("Product Details", "")), product_value) 

            score = 1 if all([ci_match, asset_match, company_match, product_match]) else 0
            workflow_scores.append(score)


        # Add results to dataframe
        data_df["Chrono result"] = chrono_results
        data_df["Product result"] = product_results
        data_df["Research result"] = research_results
        data_df["Comms result"] = comms_results
        data_df["workflow score"] = workflow_scores
        
        try:
            data_df["workflow wboxGrade"] = workflow_scores
        except Exception as e:
            print(f"error when setting grades for workflow with error: {e}")
            
        return data_df.to_json()    

    except Exception as e:
        self.update_state(state='ERROR', meta={'current': None, 'total': total_record})
        return {
            "status": "ERROR",
            "msg": "error in processing blackbox sdrflow batch request"
        }    
