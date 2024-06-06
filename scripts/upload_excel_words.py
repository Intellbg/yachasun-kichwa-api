import pandas as pd 
import requests
import json

url = "http://localhost:3000/api/v1/word"
headers = {
  'Content-Type': 'application/json'
}
df = pd.read_excel("/Users/rnbp/OneDrive - Escuela Politécnica Nacional/tesis/Vocab.xlsx", sheet_name='adultos-basico.vocab')
df = df.dropna()
print(df)
for row in df.iterrows():
    values=row[1]
    payload = json.dumps({
        "kichwa":values['kichwa'],
        "spanish":values['spanish'],
        "english":values['english'],
        "tags":values['tags'].split(","),
        "lecture":values['lecture'].split(","),
    })
    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)
