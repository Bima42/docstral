from typing import List, Dict, Any

SEARCH_DOCUMENTATION_TOOL = {
    "type": "function",
    "function": {
        "name": "search_documentation",
        "description": (
            "Search Mistral AI's official documentation for information about "
            "API usage, models, features, parameters, and code examples. "
            "Use this when the user asks questions about Mistral AI's services or technical implementation details."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "The search query to find relevant documentation. "
                        "Be specific and include key terms from the user's question."
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
