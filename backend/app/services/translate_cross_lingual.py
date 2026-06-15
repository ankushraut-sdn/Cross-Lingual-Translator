import random

class TranslationService:
    def __init__(self):
        # Full sentence translations for clean demo runs
        self.sentence_db = {
            "welcome to your mlops portfolio.": {
                "es": "Bienvenido a su cartera de MLOps.",
                "fr": "Bienvenue dans votre portefeuille MLOps.",
                "de": "Willkommen in Ihrem MLOps-Portfolio.",
                "hi": "आपके MLOps पोर्टफोलियो में आपका स्वागत है।"
            },
            "agentic model pipelines are fully online.": {
                "es": "Las canalizaciones de modelos agentes están completamente en línea.",
                "fr": "Les pipelines de modèles agentiels sont entièrement en ligne.",
                "de": "Agentische Modell-Pipelines sind vollständig online.",
                "hi": "एजेंटिक मॉडल पाइपलाइनें पूरी तरह से ऑनलाइन हैं।"
            }
        }
        
        # Word level mapper for fallback translations
        self.word_db = {
            "hello": {"es": "hola", "fr": "bonjour", "de": "hallo", "hi": "नमस्ते"},
            "world": {"es": "mundo", "fr": "monde", "de": "welt", "hi": "दुनिया"},
            "the": {"es": "el", "fr": "le", "de": "der", "hi": "यह"},
            "model": {"es": "modelo", "fr": "modèle", "de": "modell", "hi": "मॉडल"},
            "is": {"es": "está", "fr": "est", "de": "ist", "hi": "है"},
            "online": {"es": "en línea", "fr": "en ligne", "de": "online", "hi": "ऑनलाइन"},
            "ai": {"es": "ia", "fr": "ia", "de": "ki", "hi": "एआई"},
            "translation": {"es": "traducción", "fr": "traduction", "de": "übersetzung", "hi": "अनुवाद"},
            "project": {"es": "proyecto", "fr": "projet", "de": "projekt", "hi": "परियोजना"}
        }

    def execute(self, text: str, target_lang: str) -> dict:
        clean_text = text.strip().lower().rstrip('.')
        
        # 1. Match full sentence if possible
        full_match_key = clean_text + "."
        if full_match_key in self.sentence_db and target_lang in self.sentence_db[full_match_key]:
            translated_text = self.sentence_db[full_match_key][target_lang]
        else:
            # Fallback word-by-word translation
            words = text.strip().split()
            translated_words = []
            for w in words:
                clean_w = w.lower().strip(".,!?")
                if clean_w in self.word_db and target_lang in self.word_db[clean_w]:
                    trans_word = self.word_db[clean_w][target_lang]
                    # Retain capitalization if original was capitalized
                    if w[0].isupper():
                        trans_word = trans_word.capitalize()
                    translated_words.append(trans_word)
                else:
                    translated_words.append(w) # Fallback to original
            translated_text = " ".join(translated_words)
            if text.endswith('.'):
                translated_text += '.'
        
        # Tokenize
        source_tokens = text.strip().split()
        target_tokens = translated_text.strip().split()
        
        # Generate simulated cross-attention weights matrix [len(target_tokens)][len(source_tokens)]
        # We want target token i to have strong attention focusing around source token (i * len(source) / len(target))
        attention_matrix = []
        for i in range(len(target_tokens)):
            row = []
            # Calculate alignment peak index
            peak_index = int(i * len(source_tokens) / len(target_tokens))
            
            # Generate scores
            scores = []
            for j in range(len(source_tokens)):
                distance = abs(j - peak_index)
                # Softmax-like bell curve centering around peak_index
                score = 10.0 / (distance + 1.0) + random.uniform(0.1, 0.5)
                scores.append(score)
                
            # Softmax normalization so that sum(scores) == 1.0
            sum_scores = sum(scores)
            normalized_scores = [round(s / sum_scores, 3) for s in scores]
            row.append(normalized_scores)
            
            # Adjust last element to make sum exactly 1.0
            diff = 1.0 - sum(normalized_scores)
            normalized_scores[-1] = round(normalized_scores[-1] + diff, 3)
            
            attention_matrix.append(normalized_scores)
            
        return {
            "success": True,
            "source_text": text,
            "translated_text": translated_text,
            "source_tokens": source_tokens,
            "target_tokens": target_tokens,
            "attention_weights": attention_matrix,
            "metrics": {
                "translation_latency_ms": random.randint(110, 240),
                "perplexity": round(random.uniform(1.02, 1.15), 3),
                "source_token_count": len(source_tokens),
                "target_token_count": len(target_tokens)
            }
        }