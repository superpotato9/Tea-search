import pandas as pd
from fastapi import FastAPI, Query, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# Load data
data = pd.read_csv("tea_flavors_filled.csv")

#['Name ', 'Type', 'caffeine ', 'ingredients', 'Brand ', 'Package  type',
#'amount per cup volume', 'amount per cut weight G', 'steep time (mins)',
#'link '],
# IMPORTANT: remove trailing/leading spaces from column names like "caffeine ", "Brand ", etc.
data.columns = data.columns.str.strip()

print(list(data.columns))


# --- Helpers ---
def caffeine_filter(state: bool) -> pd.DataFrame:
    # If your CSV caffeine column is actually boolean True/False, this works.
    # If it's "Yes/No" or "Caffeinated/Decaf", you’ll need a mapping.
    return data[data["caffeine"].fillna(False) == state]


def search_df(column: str, term: str) -> pd.DataFrame:
    if column not in data.columns:
        raise KeyError(f"Column '{column}' not found. Valid columns: {list(data.columns)}")

    # Case-insensitive contains match
    return data[
        data[column]
        .fillna("")
        .astype(str)
        .str.contains(term, case=False, na=False)
    ]


# --- App ---
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:63342",
    "http://127.0.0.1",
    "http://localhost:8080",
    "https://localhost:8000",
    "https://localhost"
    "http://0.0.0.0",
    "https://0.0.0.0",
    "https://nathank.page",
    "http://nathan.page"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/caffeine/{input_bool}")
def get_caffeine(input_bool: bool):
    result_df = caffeine_filter(input_bool)

    return {
        "input_bool": input_bool,
        "count": len(result_df),
        "results": result_df.to_json(orient='records', indent=4),
    }


# /search/{type}?term=Black
@app.get("/search/{input_column}")
def search_endpoint(
        input_column: str,
        term: str = Query(..., description="Search term, e.g. Black")
):
    try:
        result_df = search_df(input_column.strip(), term)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "column": input_column,
        "term": term,
        "count": len(result_df),
        "results": result_df.to_json(orient='records', indent=4),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
