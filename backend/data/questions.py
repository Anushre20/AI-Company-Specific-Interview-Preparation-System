questions = [
    {
        "id": 1,
        "question": "Given an array of n integers, find all pairs that sum to a target value k. Optimize for both time and space complexity, and discuss trade-offs.",
        "followUp": "What if the input array is already sorted? How would your approach change? What's the new complexity?",
        "hint": "Consider using a HashMap for O(n) time with O(n) space, or two pointers for O(n log n) time with O(1) space if sorted.",
        "difficulty": "Medium",
        "timeLimit": 180,
        "tags": ["Arrays", "HashMap", "Two Pointers"]
    },
    {
        "id": 2,
        "question": "Explain the difference between a process and a thread. When would you choose multi-processing over multi-threading?",
        "followUp": "How do threads communicate with each other? What synchronization primitives are available and what problems do they solve?",
        "hint": "Think about memory sharing, context switching overhead, and use-cases like CPU-bound vs I/O-bound tasks.",
        "difficulty": "Medium",
        "timeLimit": 120,
        "tags": ["OS", "Concurrency"]
    },
    {
        "id": 3,
        "question": "Design a push notification system that delivers 1 million notifications per minute across email, SMS, and push. How would you ensure at-least-once delivery?",
        "followUp": "How would you handle notification failures and retries? What if a user's device is offline for 3 days?",
        "hint": "Consider message queues (Kafka/SQS), fan-out pattern, rate limiting per channel, and exponential backoff for retries.",
        "difficulty": "Hard",
        "timeLimit": 240,
        "tags": ["System Design", "Scalability", "Queues"]
    }
]