# Petri Nets Visualizer

This project lets you design and simulate simple Petri nets directly in the browser.  

## Features

- Create places, transitions and arcs.
- Export or import a model using JSON files.
- Load an event log from a CSV file and replay it on the model.
- Filter the log by `case_id` to replay either the whole log or a single trace.

## Event log format

CSV files must contain the following columns:

```
case_id,timestamp,activity
```

Each row represents an event. `activity` must match the key of a transition in the model.

## Running

Open `pnet.html` in a browser. Use the toolbar to build or load a model.  
The **Load Log** button lets you choose a CSV log. After loading, select a `case_id` from the dropdown or keep `All` and press **Run** to replay the log on the Petri net.
