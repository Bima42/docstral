from typing import List, Dict, Any

SEARCH_DOCUMENTATION_TOOL = {
    "type": "function",
    "function": {
        "name": "search_documentation",
        "description": (
            "Search Mistral AI's official documentation for ANY question about Mistral AI, including: "
            "API usage, models, features, parameters, pricing, rate limits, authentication, deployment, "
            "code examples, migration guides, and troubleshooting. "
            "\n\n"
            "**When to use:** Call this for EVERY user question related to Mistral AI or its services. "
            "Do not answer from memory without checking the docs first. "
            "\n\n"
            "**Returns:** Relevant excerpts with document titles and URLs. You must cite these sources in your response."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "A precise search query extracted from the user's question. "
                        "Include key terms like model names, API endpoints, or feature names. "
                        "Examples: 'mistral-large-2 pricing', 'streaming chat completion', 'function calling parameters'."
                    ),
                }
            },
            "required": ["query"],
        },
    },
}


def get_mistral_tools() -> List[Dict[str, Any]]:
    """Return list of available tools for Mistral API."""
    return [SEARCH_DOCUMENTATION_TOOL]
