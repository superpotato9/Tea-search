import pandas as pd
from fastapi import FastAPI
import uvicorn
import json
import numpy as np
data = pd.read_csv("tea_flavors_filled.csv")
print(data.keys())
#['Name ', 'Type', 'caffeine ', 'ingredients', 'Brand ', 'Package  type',
#'amount per cup volume', 'amount per cut weight G', 'steep time (mins)',
#'link '],

def caffeine(state: bool):
    filtered_df = data[data["caffeine "].fillna("") == state]
    return filtered_df

app_bool = FastAPI()

@app_bool.get("/caffeine/{input_bool}")
def get_caffeine(input_bool: bool):
    result_df = caffeine(input_bool)


    print(result_df)
    return {
        "input_bool": input_bool,
        "count": int(len(result_df)),
        "result": result_df.to_json()  # ✅ JSON-serializable
    }
#.to_dict(orient="records")

if __name__ == "__main__":
    uvicorn.run(app_bool, host="127.0.0.1", port=8000)

