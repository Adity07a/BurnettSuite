import json
from unittest.mock import patch
from django.test import SimpleTestCase

from .services import evaluate_interview_answer


class EvaluationTests(SimpleTestCase):
    @patch("evaluations.services._bedrock_completion")
    def test_invalid_scores_are_rejected(self, client):
        for score in (-1, 101, float("nan"), True, "90"):
            client.return_value = json.dumps({"overall_score": score})
            with self.assertRaises(ValueError):
                evaluate_interview_answer("Question?", "Answer")

    @patch("evaluations.services._bedrock_completion")
    def test_valid_evaluation(self, client):
        data = {key: 80 for key in ("overall_score", "technical_score", "communication_score", "relevance_score", "correctness_score")}
        data.update(strengths=["Clear explanation"], weaknesses=["Add examples"], feedback="Good", improved_answer="Example")
        client.return_value = json.dumps(data)
        self.assertEqual(evaluate_interview_answer("Question?", "Answer"), data)
        self.assertEqual(client.call_args.kwargs["operation"], "evaluation")
