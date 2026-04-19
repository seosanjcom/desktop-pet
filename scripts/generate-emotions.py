"""Gemini 이미지 생성 — 기존 캐릭터 레퍼런스로 새 감정/포즈 생성"""
import base64
import json
import sys
import os
import time
import urllib.request
import urllib.error

API_KEYS = [k.strip() for k in os.environ.get("GEMINI_API_KEYS", "").split(",") if k.strip()]
if not API_KEYS:
    API_KEYS = [os.environ.get("GEMINI_API_KEY", "")]
if not API_KEYS[0]:
    print("Set GEMINI_API_KEYS (comma-separated) or GEMINI_API_KEY env var")
    sys.exit(1)
_key_idx = 0

def get_api_url():
    global _key_idx, _model_idx
    key = API_KEYS[_key_idx % len(API_KEYS)]
    model = MODELS[_model_idx % len(MODELS)]
    return f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

def rotate_key():
    global _key_idx, _model_idx
    _key_idx += 1
    if _key_idx % len(API_KEYS) == 0:
        _model_idx += 1
        print(f"  Switching to model: {MODELS[_model_idx % len(MODELS)]}")
    print(f"  Rotating to key #{_key_idx % len(API_KEYS) + 1}")
MODELS = ["gemini-3-pro-image-preview", "gemini-3.1-flash-image-preview", "gemini-2.5-flash-image"]
_model_idx = 0

CHARACTERS = {
    "tani": {
        "dir": "public/characters/tani",
        "ref": "public/characters/tani/default.png",
        "desc": "a cute muscular gorilla/orangutan character with simple line art, flat beige/brown colors, round body, small face with dot eyes and a small smile, thick outlined cartoon style, white background, no text",
    },
    "kingcat": {
        "dir": "public/characters/kingcat",
        "ref": "public/characters/kingcat/default.png",
        "desc": "a cute muscular orange tabby cat character with simple line art, flat orange/cream colors, round body, small face with closed/dot eyes, thick outlined cartoon style, white background, no text",
    },
}

EMOTIONS = {
    "excited": "jumping with both arms raised, very happy and excited expression, sparkle eyes",
    "love": "making a heart shape with both hands, blushing cheeks, loving expression with heart eyes",
    "confused": "tilting head to one side, question mark above head, one hand scratching head, puzzled expression",
    "proud": "standing tall with chest puffed out, hands on hips, confident smirk, power pose",
    "shy": "covering face with both hands, peeking through fingers, blushing, turned slightly sideways",
    "dance": "one leg up, both arms swinging, dynamic dancing pose, happy expression",
    "wave": "waving one hand high, friendly smile, greeting pose",
    "think": "hand on chin, looking up, thoughtful expression, thinking pose",
    "cry": "tears streaming down, wiping eyes with one hand, sad crying expression",
    "surprise": "mouth wide open, hands on cheeks, shocked/surprised expression, wide eyes",
    "cheer": "both fists pumping up, celebrating, huge grin, victory pose",
    "tired2": "slumped over, droopy eyes, yawning, exhausted pose, sweat drop",
    "hug": "arms stretched wide open, ready for a hug, warm smile, inviting pose",
    "snack": "holding food in both hands, munching, happy eating expression, crumbs around mouth",
    "wink": "one eye closed winking, finger pointing at viewer, playful expression, slight smile",
}


def load_image_b64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def generate_image(ref_b64: str, char_desc: str, emotion_name: str, emotion_desc: str, _retries: int = 0) -> bytes | None:
    max_retries = len(API_KEYS) * len(MODELS)
    if _retries >= max_retries:
        print(f"  All keys+models exhausted for {emotion_name}")
        return None
    prompt = (
        f"Look at this reference character image carefully. "
        f"Generate a NEW image of this EXACT SAME character ({char_desc}) "
        f"in a different pose/emotion: {emotion_desc}. "
        f"CRITICAL: Keep the EXACT same art style, line thickness, color palette, and proportions. "
        f"The character must look identical — same body shape, same face style, same coloring. "
        f"Only the pose and facial expression should change. "
        f"Draw the full body on a pure white background. No text, no watermark."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"inlineData": {"mimeType": "image/png", "data": ref_b64}},
                    {"text": prompt},
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "temperature": 0.4,
        },
    }

    data = json.dumps(payload).encode()
    url = get_api_url()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  HTTP {e.code}: {body[:200]}")
        if e.code == 429:
            rotate_key()
            return generate_image(ref_b64, char_desc, emotion_name, emotion_desc, _retries + 1)
        return None
    except Exception as e:
        print(f"  Error: {e}")
        return None

    for candidate in result.get("candidates", []):
        for part in candidate.get("content", {}).get("parts", []):
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])

    print(f"  No image in response: {json.dumps(result)[:300]}")
    return None


def main():
    char_name = sys.argv[1] if len(sys.argv) > 1 else "tani"
    emotion_filter = sys.argv[2] if len(sys.argv) > 2 else None

    if char_name not in CHARACTERS:
        print(f"Unknown character: {char_name}. Available: {list(CHARACTERS.keys())}")
        return

    char = CHARACTERS[char_name]
    ref_path = char["ref"]

    if not os.path.exists(ref_path):
        print(f"Reference image not found: {ref_path}")
        return

    print(f"Loading reference: {ref_path}")
    ref_b64 = load_image_b64(ref_path)

    emotions = EMOTIONS
    if emotion_filter:
        emotions = {k: v for k, v in EMOTIONS.items() if k == emotion_filter}

    out_dir = char["dir"]
    os.makedirs(out_dir, exist_ok=True)

    for emo_name, emo_desc in emotions.items():
        out_path = os.path.join(out_dir, f"{emo_name}.png")
        if os.path.exists(out_path):
            print(f"  Skip {emo_name} (already exists)")
            continue

        print(f"  Generating {emo_name}...")
        img_data = generate_image(ref_b64, char["desc"], emo_name, emo_desc)

        if img_data:
            with open(out_path, "wb") as f:
                f.write(img_data)
            print(f"  Saved {out_path} ({len(img_data)} bytes)")
        else:
            print(f"  Failed {emo_name}")

        time.sleep(2)

    print("Done!")


if __name__ == "__main__":
    main()
