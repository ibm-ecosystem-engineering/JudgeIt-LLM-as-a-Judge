import requests
import json

class BAM:

    def __init__(self, model, url, tokenization_url, api_key) -> None:
        self.model = model
        self.url = url
        self.tokenization_url = tokenization_url
        self.BAM_API_KEY = api_key

    def ask(self, prompt, temperature=0.7, max_new_tokens=128, greedy=True, stop_sequences=None,
            truncate_input_tokens=0, return_num_tokens=False):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.BAM_API_KEY}'
        }
        decoding_method = 'greedy' if greedy else 'sample'
        data = {
            "model_id": self.model,
            "input": prompt,
            "parameters": {
                "temperature": temperature,
                "max_new_tokens": max_new_tokens,
                "decoding_method": decoding_method,
                "stop_sequences": stop_sequences,
                "truncate_input_tokens": truncate_input_tokens
            }
        }
        response = requests.post(self.url, headers=headers, data=json.dumps(data))
        num_tokens_in, num_tokens_out = None, None
        try:
            outputf = response.json()['results'][0]['generated_text']
            num_tokens_in = response.json()['results'][0]['input_token_count']
            num_tokens_out = response.json()['results'][0]['generated_token_count']

            success = True
        except KeyError:
            print("Error:\n", response.json())
            success = False

        # if return_num_tokens:
        return outputf, num_tokens_in, num_tokens_out, success
        # else:
        #     return outputf, success

    def ask_batch(self, prompt, temperature=0.7, max_new_tokens=128, greedy=True):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.BAM_API_KEY}'
        }
        decoding_method = 'greedy' if greedy else 'sample'
        data = {
            "model_id": self.model,
            "inputs": prompt,
            "parameters": {
                "temperature": temperature,
                "max_new_tokens": max_new_tokens,
                "decoding_method": decoding_method
            }
        }
        response = requests.post(self.url, headers=headers, data=json.dumps(data))
        outputf = [x['generated_text'] for x in response.json()['results']]
        return outputf

