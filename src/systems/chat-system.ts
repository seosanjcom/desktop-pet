import type { PetEmotion } from "@/types/pet";
import type { PetStats, CharacterType, UserOccupation } from "@/types/pet";

export const CHAT_INTERVAL_MIN_MS = 120 * 1000;
export const CHAT_INTERVAL_MAX_MS = 600 * 1000;
const NEGLECT_THRESHOLD_MS = 15 * 60 * 1000;

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

interface CharacterDialogue {
  time: Record<TimeOfDay, string[]>;
  emotion: Record<PetEmotion, string[]>;
  stat: { hungry: string[]; tired: string[]; bored: string[] };
  neglect: string[];
  affection: string[];
  actionReaction: Record<string, string[]>;
  pat: string[];
  drag: string[];
  cursorNear: string[];
  welcome: string;
  firstMeet: string;
}

const ORANGUTAN: CharacterDialogue = {
  time: {
    morning: [
      "좋은 아침~",
      "일어났어? 나도 방금 일어남",
      "아침이다 아침",
      "오늘 뭐 해?",
      "밥 먹었어? 나는 아직",
      "아침부터 기분 좋다",
      "오늘도 화이팅",
      "눈 떠보니 아침이네",
      "스트레칭 한 번 해야겠다",
    ],
    afternoon: [
      "점심 뭐 먹었어?",
      "오후다... 졸리다",
      "나는 여기서 기다리고 있을게",
      "간식 먹고 싶다",
      "좀 지루한 시간이야",
      "오후 햇살 좋다",
      "바나나 먹고 싶은 타이밍",
      "아 눕고 싶다",
      "그냥 뒹굴뒹굴하고 싶어",
    ],
    evening: [
      "오늘 수고했어",
      "저녁이야 저녁",
      "하루 끝났다~ 쉬자",
      "저녁 뭐 먹을 거야?",
      "이제 좀 쉬어도 되지?",
      "보고 싶었어",
      "저녁 바람 좋다",
      "오늘 어땠어?",
    ],
    night: [
      "아직 안 자?",
      "나 졸린데",
      "밤이 깊어가네",
      "같이 있어줘서 좋다",
      "잘 자~ 내일 보자",
      "밤에 조용한 거 좋아",
      "슬슬 잘 시간이야",
      "눈이 감긴다...",
    ],
  },
  emotion: {
    happy: [
      "오늘 기분 좋다!",
      "같이 있으니까 좋아",
      "행복하다 진짜",
      "이런 날이 좋아",
      "기분 최고",
      "웃음이 나와",
      "좋은 하루다",
      "뭔가 다 잘 될 것 같아",
      "이대로가 좋다",
    ],
    neutral: [
      "심심하다",
      "뭐 하고 있어?",
      "나 좀 봐봐",
      "그냥 있는 중",
      "할 게 없다",
      "뭔가 하고 싶은데 뭘 하지",
      "그냥 멍 때리는 중",
      "오늘 특별한 거 없나",
      "바나나나 먹을까",
      "여기 있어도 돼?",
    ],
    sad: [
      "좀 슬프다...",
      "기분이 별로야",
      "나 좀 안아줘",
      "혼자 있기 싫어",
      "왜 이러지...",
      "좀 외롭다",
      "안아주면 나을 것 같아",
    ],
    angry: [
      "배고파 진짜로",
      "밥 좀 줘",
      "이러면 좀 그렇지 않아?",
      "나 화났어",
      "방치하지 마",
      "진짜 배고프다고",
      "좀 신경 써줘",
    ],
    sleepy: [
      "졸려...",
      "눈이 감겨",
      "잠깐만 눈 좀 붙일게",
      "피곤해 죽겠다",
      "재워줘...",
      "5분만... 5분만 더",
      "그냥 누워있고 싶다",
    ],
  },
  stat: {
    hungry: [
      "배고파",
      "밥 줘",
      "뭐라도 먹고 싶다",
      "배에서 소리 난다",
      "바나나 없어?",
      "배고프다 진짜로",
      "밥 타이밍이야",
      "뭐 좀 줘",
    ],
    tired: [
      "피곤해",
      "에너지가 없어",
      "좀 쉬고 싶다",
      "재워줘",
      "움직이기 싫다",
      "배터리 방전",
      "충전 필요",
    ],
    bored: [
      "심심해",
      "놀아줘",
      "뭐 재미있는 거 없어?",
      "같이 놀자",
      "할 게 없다",
      "지루하다 진짜",
      "나랑 놀아줘",
    ],
  },
  neglect: [
    "나 무시하는 거야?",
    "여기 있는데...",
    "나 아직 여기 있어",
    "꽤 됐는데... 어디 갔어?",
    "혼자 두고 가면 어떡해",
    "외롭다",
    "뭐라도 해줘",
    "나 잊은 거 아니지?",
    "아직 기다리고 있어",
  ],
  affection: [
    "나 좀 봐",
    "같이 있어서 좋아",
    "오늘도 잘 부탁해",
    "나 귀엽지?",
    "여기 있을게",
    "계속 같이 있자",
    "포근하다",
    "네가 좋아",
    "고마워 항상",
  ],
  actionReaction: {
    feed: [
      "맛있다!",
      "고마워~",
      "배 든든해졌다",
      "이 맛이야",
      "최고야",
      "잘 먹겠습니다",
      "행복하다 진짜",
    ],
    play: [
      "재미있다!",
      "더 하자!",
      "신난다!!",
      "놀아줘서 고마워",
      "이거 좋아",
      "또 하자 또!",
      "기분 좋다!",
    ],
    sleep: [
      "잘게... zZz",
      "꿈에서 보자",
      "잘 자...",
      "눈 감는다... zZz",
      "포근하다... 잘게",
      "내일 보자...",
    ],
  },
  pat: [
    "기분 좋다",
    "좋아좋아",
    "더 해줘",
    "고마워~",
  ],
  drag: [
    "으악 놔줘!!",
    "높다고!!",
    "떨어진다!!",
    "살살해!!",
  ],
  cursorNear: [
    "왜~ ㅎㅎ",
    "오 왔어?",
    "심심했는데 잘 왔다",
    "뭐 해~",
    "나한테 관심 있어?",
    "놀아줄 거야?",
    "오늘 어때?",
    "나 좀 봐봐",
  ],
  welcome: "~ 왔어! 보고 싶었다 💕",
  firstMeet: "안녕! 나는 너의 오랑우탄이야~ 잘 부탁해! 🐵",
};

const CAT: CharacterDialogue = {
  time: {
    morning: [
      "아침이야",
      "밥은 먹었어?",
      "잘 잤어?",
      "좋은 아침~",
      "아침부터 기분 좋다",
      "일어났어? 나는 진작 깨어있었어",
      "스트레칭 한 번 하자 기지개~",
      "오늘도 시작이다",
      "커피 마시고 싶다",
    ],
    afternoon: [
      "점심 뭐야?",
      "졸리다...",
      "나는 여기서 기다릴게",
      "간식 타임",
      "오후 햇살에 낮잠 자고 싶다",
      "좀 지루한데",
      "창밖에 새가 있어",
      "그루밍이나 해야지",
      "나 좀 봐봐",
    ],
    evening: [
      "퇴근했어? 오늘 어땠어?",
      "저녁 뭐 먹을 거야?",
      "오늘 수고했다",
      "이제 쉬는 시간",
      "나한테 좀 더 신경 써줘",
      "오늘 하루도 끝",
      "저녁에는 같이 놀자",
      "참치 먹고 싶다",
    ],
    night: [
      "아직 안 자?",
      "밤이 깊어가네",
      "밤에 눈이 더 잘 보인다",
      "같이 있어줘서 좋아",
      "잘 자~",
      "나는 밤이 좋아",
      "슬슬 잘 시간",
      "소파에서 뒹굴하고 싶다",
    ],
  },
  emotion: {
    happy: [
      "기분 좋다",
      "같이 있으니까 좋아",
      "오늘 최고의 하루",
      "행복하다",
      "이런 기분 오래 가면 좋겠다",
      "기분 좋아서 그루밍 중",
      "꼬리가 저절로 움직여",
      "좋은 날이야",
      "골골골~",
    ],
    neutral: [
      "심심해",
      "오늘 뭐 해?",
      "나 좀 봐",
      "그냥 있는 중",
      "할 게 없다",
      "박스 하나 줘",
      "뭔가 하고 싶은데",
      "그냥 멍 때리는 중",
      "창밖이 궁금하다",
      "그루밍이나 할까",
    ],
    sad: [
      "기분이 별로야",
      "좀 슬프다",
      "나 좀 안아줘",
      "혼자 있기 싫어",
      "구석에 숨고 싶다",
      "왜 이러지...",
      "위로해줘",
    ],
    angry: [
      "배고파 진짜",
      "밥 줘",
      "방치하지 마",
      "나 화났어",
      "건드리지 마",
      "꼬리 보여? 화났다는 뜻이야",
      "진짜 배고프다고",
    ],
    sleepy: [
      "졸려...",
      "눈이 감겨",
      "잠깐만 좀 잘게",
      "피곤해 죽겠다",
      "18시간은 자야 하는데",
      "이불 속에 들어가고 싶다",
      "5분만... 5분만 더",
    ],
  },
  stat: {
    hungry: [
      "배고파",
      "밥 줘",
      "밥 그릇 비었다",
      "참치 없어?",
      "뭐라도 줘",
      "배에서 소리 난다",
      "츄르 줘",
      "진짜 배고프다고",
    ],
    tired: [
      "피곤해",
      "에너지 없다",
      "쉬고 싶어",
      "재워줘",
      "이불 속으로 가고 싶다",
      "배터리 방전",
      "잠이 보약이야",
    ],
    bored: [
      "심심해",
      "놀아줘",
      "재미있는 거 없어?",
      "같이 놀자",
      "장난감 줘",
      "레이저 포인터 없어?",
      "나랑 놀아줘",
    ],
  },
  neglect: [
    "나 무시하는 거야?",
    "여기 있는데...",
    "나 아직 여기 있어",
    "어디 갔어?",
    "혼자 두고 어디 간 거야",
    "외롭다",
    "뭐라도 해줘",
    "키보드 위에 올라갈 거야",
    "모니터 앞에 앉아야겠다",
  ],
  affection: [
    "나 좀 봐",
    "같이 있어서 좋아",
    "오늘도 잘 부탁해",
    "나 귀엽지?",
    "여기 있을게",
    "계속 같이 있자",
    "골골골~",
    "꼬리 살랑살랑",
    "네가 제일 좋아",
  ],
  actionReaction: {
    feed: [
      "맛있다!",
      "고마워!",
      "배 든든해졌다",
      "이 맛이야",
      "최고야",
      "더 없어?",
      "잘 먹었다",
    ],
    play: [
      "재미있다!",
      "더 하자!",
      "신난다!!",
      "고마워~",
      "이거 좋다",
      "잡았다!",
      "또 하자!",
    ],
    sleep: [
      "잘게... zZz",
      "꿈에서 보자",
      "잘 자...",
      "눈 감는다... zZz",
      "이불 속 최고",
      "내일 보자",
    ],
  },
  pat: [
    "기분 좋다",
    "골골골~",
    "더 해줘",
    "좋아좋아",
  ],
  drag: [
    "으악!! 놔줘!!",
    "높다고!! 무서워!!",
    "살려줘!!",
    "떨어진다!!",
  ],
  cursorNear: [
    "뭐야",
    "ㅎㅎ 왜",
    "할 거 있어?",
    "나한테 뭔가 줄 거야?",
    "왔어?",
    "같이 놀래?",
    "거기서 뭐 해",
    "심심했는데",
  ],
  welcome: "~ 왔어! 보고 싶었다 💕",
  firstMeet: "안녕! 나는 네 고양이야~ 잘 부탁해! 🐾",
};

const PENGUIN: CharacterDialogue = {
  time: {
    morning: [
      "좋은 아침!",
      "일어났어? 나도 방금",
      "아침이야 아침",
      "오늘 뭐 해?",
      "밥 먹었어?",
      "아침부터 기분 좋다",
      "오늘도 뒤뚱뒤뚱",
      "시원한 아침이야",
      "스트레칭 한 번 해야지",
    ],
    afternoon: [
      "점심 뭐 먹었어?",
      "오후다... 더운 거 싫어",
      "시원한 데 가고 싶다",
      "간식 먹고 싶다",
      "좀 심심한 시간이야",
      "산책하고 싶다",
      "아이스크림 먹고 싶다",
      "수영하고 싶은 타이밍",
    ],
    evening: [
      "오늘 수고했어",
      "저녁이야",
      "하루 끝났다~",
      "저녁 뭐 먹을 거야?",
      "이제 쉬자",
      "보고 싶었어",
      "저녁 바람 시원하다 좋아",
    ],
    night: [
      "아직 안 자?",
      "나 졸린데",
      "밤이네",
      "같이 있어줘서 좋다",
      "잘 자~ 내일 보자",
      "밤에 조용한 거 좋아",
      "슬슬 잘 시간이야",
    ],
  },
  emotion: {
    happy: [
      "기분 좋다!",
      "같이 있으니까 좋아",
      "행복하다 진짜",
      "오늘 최고야",
      "뒤뚱뒤뚱 기분 좋다",
      "좋은 하루다",
      "이런 날이 좋아",
      "날개 파닥파닥!",
      "기분이 날아갈 것 같아",
    ],
    neutral: [
      "심심하다",
      "뭐 해?",
      "나 좀 봐",
      "그냥 있는 중",
      "수영하고 싶다",
      "뭔가 하고 싶은데",
      "물고기 생각난다",
      "날개가 근질근질",
      "어디 가고 싶다",
      "뭐 재미있는 거 없나",
    ],
    sad: [
      "좀 슬프다...",
      "기분이 별로야",
      "나 좀 안아줘",
      "혼자라서 외로워",
      "바다가 보고 싶다",
      "왜 이러지...",
      "안아주면 나을 것 같아",
    ],
    angry: [
      "배고파 진짜",
      "밥 줘",
      "나 화났어",
      "방치하지 마",
      "진짜 배고프다고",
      "이러면 삐진다",
    ],
    sleepy: [
      "졸려...",
      "눈이 감겨",
      "잠깐만 좀 잘게",
      "피곤하다 진짜",
      "재워줘...",
      "서서 자도 돼?",
    ],
  },
  stat: {
    hungry: [
      "배고파",
      "밥 줘",
      "물고기 없어?",
      "뭐라도 먹고 싶다",
      "배에서 소리 난다",
      "새우라도 줘",
      "진짜 배고프다",
    ],
    tired: [
      "피곤해",
      "에너지 없어",
      "좀 쉬고 싶다",
      "재워줘",
      "움직이기 싫다",
      "서서라도 자고 싶다",
    ],
    bored: [
      "심심해",
      "놀아줘",
      "뭐 재미있는 거 없어?",
      "같이 놀자",
      "미끄럼 타고 싶다",
      "수영하러 가자",
    ],
  },
  neglect: [
    "나 무시하는 거야?",
    "여기 있는데...",
    "나 아직 여기 있어",
    "어디 갔어?",
    "혼자 두고 가면 어떡해",
    "외롭다",
    "뭐라도 해줘",
    "기다리고 있었어",
  ],
  affection: [
    "나 좀 봐",
    "같이 있어서 좋아",
    "오늘도 잘 부탁해",
    "나 귀엽지?",
    "여기 있을게",
    "계속 같이 있자",
    "네가 제일 따뜻해",
    "파닥파닥~",
    "고마워 항상",
  ],
  actionReaction: {
    feed: [
      "맛있다!",
      "고마워!",
      "배 든든해졌다",
      "이 맛이야",
      "최고야",
      "잘 먹겠습니다",
    ],
    play: [
      "재미있다!",
      "더 하자!",
      "신난다!!",
      "고마워~",
      "뒤뚱뒤뚱!",
      "또 하자!",
    ],
    sleep: [
      "잘게... zZz",
      "꿈에서 보자",
      "잘 자...",
      "눈 감는다... zZz",
      "내일 보자",
    ],
  },
  pat: [
    "기분 좋다",
    "따뜻하다~",
    "더 해줘",
    "좋아좋아",
  ],
  drag: [
    "으악 놔줘!!",
    "높다!! 못 날아!!",
    "떨어진다!!",
    "살살해!!",
  ],
  cursorNear: [
    "어 왔어?",
    "ㅎㅎ 뭐야",
    "놀아줄 거야?",
    "심심했는데",
    "나 봐줘~",
    "뭐 해?",
    "오늘 어때?",
    "같이 놀자",
  ],
  welcome: "~ 왔어! 보고 싶었다 💕",
  firstMeet: "안녕! 나는 너의 펭귄이야~ 잘 부탁해! 🐧",
};

const HAMSTER: CharacterDialogue = {
  time: {
    morning: [
      "좋은 아침~",
      "일어났어? 나는 이제 잘 시간인데",
      "아침이다",
      "해바라기씨 어딨어?",
      "밥 먹었어?",
      "아침부터 기분 좋다",
      "오늘도 열심히 굴려야지",
      "씨앗 냄새 솔솔",
    ],
    afternoon: [
      "점심 뭐야?",
      "졸리다...",
      "간식 시간이야",
      "볼에 뭐 넣고 싶다",
      "좀 심심한 시간",
      "굴 속에서 자고 싶어",
      "해바라기씨 먹고 싶다",
      "오후 낮잠 최고",
    ],
    evening: [
      "저녁이야! 이제 활동 시간!",
      "해 졌다~ 이제 신난다",
      "오늘 수고했어",
      "저녁밥 뭐야?",
      "이제부터 달린다",
      "야행성이라 지금부터야",
      "눈이 커지는 시간",
    ],
    night: [
      "밤이다!! 활동 시간!",
      "쳇바퀴 돌릴 거야!",
      "밤에 제일 활발해",
      "아직 안 자? 나는 지금 시작",
      "밤산책 가고 싶다",
      "다다다다!",
      "쉿~ 조용히",
    ],
  },
  emotion: {
    happy: [
      "기분 좋다!",
      "같이 있으니까 좋아",
      "볼 빵빵! 행복",
      "오늘 최고야",
      "기분이 너무 좋아",
      "좋은 하루다",
      "이런 날이 좋아",
      "뒹굴뒹굴 좋다",
      "행복하다 진짜",
    ],
    neutral: [
      "심심해",
      "뭐 해?",
      "나 좀 봐",
      "볼에 뭐 넣고 싶다",
      "쳇바퀴 타고 싶다",
      "뭔가 하고 싶은데",
      "씨앗 생각난다",
      "굴 파고 싶다",
      "뭐 재미있는 거 없나",
      "어딘가 숨고 싶다",
    ],
    sad: [
      "좀 슬프다...",
      "기분이 별로야",
      "나 좀 안아줘",
      "볼이 텅 비었다...",
      "혼자 있기 싫어",
      "굴 속에 숨고 싶다",
      "왜 이러지...",
    ],
    angry: [
      "배고파 진짜",
      "밥 줘",
      "나 화났어",
      "방치하지 마",
      "이러면 물어버린다",
      "볼 부풀린다 화났어",
    ],
    sleepy: [
      "졸려...",
      "눈이 감겨",
      "잠깐만 좀 잘게",
      "피곤하다",
      "둥글게 말려서 잘래",
      "재워줘...",
    ],
  },
  stat: {
    hungry: [
      "배고파",
      "밥 줘",
      "해바라기씨 없어?",
      "볼에 넣을 게 없다",
      "뭐라도 먹고 싶다",
      "배에서 소리 난다",
      "견과류라도 줘",
    ],
    tired: [
      "피곤해",
      "에너지 없다",
      "쉬고 싶어",
      "재워줘",
      "쳇바퀴 너무 많이 탔나",
      "둥글게 말려서 자고 싶다",
    ],
    bored: [
      "심심해",
      "놀아줘",
      "쳇바퀴 타고 싶다",
      "같이 놀자",
      "뭔가 씹고 싶다",
      "굴 파고 싶다",
    ],
  },
  neglect: [
    "나 무시하는 거야?",
    "여기 있는데...",
    "나 아직 여기 있어",
    "어디 갔어?",
    "혼자 두고 가면 어떡해",
    "외롭다... 나 작으니까 안 보여?",
    "뭐라도 해줘",
    "굴 속에 숨어있을 거야",
  ],
  affection: [
    "나 좀 봐",
    "같이 있어서 좋아",
    "오늘도 잘 부탁해",
    "나 귀엽지? 볼 봐봐",
    "여기 있을게",
    "계속 같이 있자",
    "볼 빵빵!",
    "네가 제일 좋아",
    "고마워 항상",
  ],
  actionReaction: {
    feed: [
      "맛있다!",
      "고마워!",
      "볼에 넣어야지",
      "이 맛이야",
      "볼 터질 것 같아",
      "최고야",
    ],
    play: [
      "재미있다!",
      "더 하자!",
      "신난다!!",
      "다다다다!",
      "또 하자!",
      "쳇바퀴!!",
    ],
    sleep: [
      "잘게... zZz",
      "꿈에서 씨앗 먹을 거야",
      "잘 자...",
      "눈 감는다... zZz",
      "둥글게 말려서... zZz",
    ],
  },
  pat: [
    "기분 좋다",
    "볼 만지지 마~ 씨앗 들었어",
    "더 해줘",
    "따뜻하다!",
  ],
  drag: [
    "으악!! 놔줘!!",
    "높다!! 무서워!!",
    "떨어진다!!",
    "나 작은데!!",
  ],
  cursorNear: [
    "뭐야 ㅎㅎ",
    "왔어?",
    "나한테 뭐 줄 거야?",
    "심심했어!",
    "같이 놀래?",
    "나 좀 봐~",
    "놀아줄 거야?",
    "오늘 어때?",
  ],
  welcome: "~ 왔어! 보고 싶었다 💕",
  firstMeet: "안녕! 나는 너의 햄스터야~ 잘 부탁해! 🐹",
};

const CHARACTER_DIALOGUES: Record<CharacterType, CharacterDialogue> = {
  orangutan: ORANGUTAN,
  cat: CAT,
  penguin: PENGUIN,
  hamster: HAMSTER,
};

function getDialogue(characterType?: CharacterType): CharacterDialogue {
  return CHARACTER_DIALOGUES[characterType ?? "cat"];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shouldTriggerChat(lastChatTime: number, now: number): boolean {
  if (lastChatTime === 0) return true;
  const elapsed = now - lastChatTime;
  if (elapsed < CHAT_INTERVAL_MIN_MS) return false;
  if (elapsed >= CHAT_INTERVAL_MAX_MS) return true;
  const range = CHAT_INTERVAL_MAX_MS - CHAT_INTERVAL_MIN_MS;
  const progress = (elapsed - CHAT_INTERVAL_MIN_MS) / range;
  return Math.random() < progress * 0.15;
}

const OCCUPATION_MESSAGES: Record<UserOccupation, Record<TimeOfDay, string[]>> = {
  student: {
    morning: ["오늘 수업 많아?", "숙제 다 했어?", "학교 가기 싫지?", "오늘 시험이야?", "가방 챙겼어?"],
    afternoon: ["수업 끝났어?", "급식 맛있었어?", "공부 잘 되고 있어?", "도서관 갈 거야?", "과제 남았어?"],
    evening: ["오늘 공부 많이 했다", "내일 준비 됐어?", "복습 좀 해야 하지 않아?", "오늘 학교 어땠어?"],
    night: ["밤새 공부하는 거야?", "내일도 학교잖아 자야지", "시험 기간이야?", "무리하지 마"],
  },
  office: {
    morning: ["출근 화이팅", "오늘 회의 있어?", "커피 한 잔 하고 시작하자", "월요일이야...?", "메일 확인했어?"],
    afternoon: ["점심 뭐 먹었어?", "오후 회의 있어?", "퇴근까지 얼마 남았어?", "야근 아니지?", "오후가 제일 길다"],
    evening: ["퇴근했어?", "야근 아니었으면", "오늘 고생했다", "내일도 출근이지?", "칼퇴 성공?"],
    night: ["아직 일하고 있어?", "야근이야...?", "일 좀 내려놓고 쉬어", "내일 출근인데 자야지"],
  },
  freelancer: {
    morning: ["오늘 작업할 거 많아?", "카페 갈 거야?", "마감 언제야?", "자유로운 아침이다", "오늘 스케줄 어때?"],
    afternoon: ["작업 잘 되고 있어?", "집중 잘 돼?", "카페 자리 좋아?", "마감 괜찮아?", "오후가 제일 잘 되는 시간이지"],
    evening: ["오늘 작업 많이 했어?", "마감 잘 맞추고 있어?", "저녁은 좀 쉬어", "컴퓨터 좀 꺼봐"],
    night: ["밤에 더 잘 되는 타입이야?", "야작이야?", "무리하지 마", "내일 해도 돼"],
  },
  selfEmployed: {
    morning: ["오늘 장사 잘 되겠다", "가게 준비 다 했어?", "오늘 손님 많을까?", "일찍 시작하는구나"],
    afternoon: ["점심 장사 어때?", "오후에 좀 한가해?", "손님 많았어?", "체력 관리 잘 해"],
    evening: ["마감 준비해야지", "오늘 매출 괜찮았어?", "고생했다 오늘도", "이제 좀 쉬어"],
    night: ["내일 준비 다 했어?", "장사 끝나고 좀 쉬어", "오늘 하루도 수고했다"],
  },
  homemaker: {
    morning: ["오늘 뭐 할 거야?", "집안일 많아?", "장 보러 갈 거야?", "아침 잘 챙겨 먹어"],
    afternoon: ["오후에 좀 쉬어", "카페라도 가봐", "나가서 바람 쐬자", "나를 위한 시간도 필요해"],
    evening: ["저녁 준비 뭐 해?", "오늘 하루 수고했어", "좀 쉬어도 돼", "맛있는 거 시켜 먹자"],
    night: ["오늘도 고생했다", "푹 쉬어", "내일은 좀 여유롭겠다", "잘 자~"],
  },
  jobSeeker: {
    morning: ["오늘 할 거 있어?", "이력서 넣었어?", "면접 준비 됐어?", "좋은 소식 올 거야", "화이팅"],
    afternoon: ["공고 확인했어?", "오늘 뭐 했어?", "포트폴리오 정리해봐", "잠깐 쉬어도 돼", "조급해하지 마"],
    evening: ["오늘도 수고했어", "분명 잘 될 거야", "너무 조급해하지 마", "쉴 때 쉬어야 해"],
    night: ["내일은 좋은 일이 있을 거야", "무리하지 마", "잘 자", "걱정 마 다 잘 될 거야"],
  },
  other: {
    morning: ["좋은 아침", "오늘 뭐 해?", "잘 잤어?", "오늘도 화이팅"],
    afternoon: ["오후다", "간식 먹고 싶다", "좀 지루한 시간이야", "뭐 하고 있어?"],
    evening: ["오늘 수고했어", "저녁이야", "좀 쉬자", "하루 끝났다~"],
    night: ["아직 안 자?", "잘 자~", "내일 보자", "푹 쉬어"],
  },
};

export function getRandomMessage(
  emotion: PetEmotion,
  stats: PetStats,
  _lastActionTime: number,
  hour: number,
  characterType?: CharacterType,
  occupation?: UserOccupation
): string {
  const d = getDialogue(characterType);
  const timeOfDay = getTimeOfDay(hour);

  if (stats.hunger < 30 && Math.random() < 0.25) return pickRandom(d.stat.hungry);
  if (stats.energy < 30 && Math.random() < 0.2) return pickRandom(d.stat.tired);
  if (stats.mood < 30 && Math.random() < 0.2) return pickRandom(d.stat.bored);

  if (emotion === "angry" || emotion === "sad" || emotion === "sleepy") {
    return pickRandom(d.emotion[emotion]);
  }

  const pool = Math.random();
  if (pool < 0.25) return pickRandom(d.time[timeOfDay]);
  if (pool < 0.50) return pickRandom(d.emotion[emotion]);
  if (pool < 0.75 && occupation) {
    const occMsgs = OCCUPATION_MESSAGES[occupation]?.[timeOfDay];
    if (occMsgs?.length) return pickRandom(occMsgs);
  }
  return pickRandom(d.affection);
}

export function getActionReactionMessage(
  action: "feed" | "play" | "sleep",
  characterType?: CharacterType
): string {
  return pickRandom(getDialogue(characterType).actionReaction[action]);
}

export function getNeglectMessage(
  neglectMs: number,
  characterType?: CharacterType
): string | null {
  if (neglectMs < NEGLECT_THRESHOLD_MS) return null;
  return pickRandom(getDialogue(characterType).neglect);
}

export function getPatMessage(characterType?: CharacterType): string {
  return pickRandom(getDialogue(characterType).pat);
}

export function getDragMessage(characterType?: CharacterType): string {
  return pickRandom(getDialogue(characterType).drag);
}

export function getCursorNearMessage(characterType?: CharacterType): string {
  return pickRandom(getDialogue(characterType).cursorNear);
}

export function getWelcomeMessage(petName: string, characterType?: CharacterType): string {
  const d = getDialogue(characterType);
  return petName ? `${petName}${d.welcome}` : d.firstMeet;
}

export function getHoverMessage(
  emotion: PetEmotion,
  stats: PetStats,
  hour: number,
  characterType?: CharacterType,
  occupation?: UserOccupation
): string {
  const d = getDialogue(characterType);
  const roll = Math.random();
  if (roll < 0.4) return pickRandom(d.cursorNear);
  if (roll < 0.65) {
    const timeOfDay = getTimeOfDay(hour);
    if (occupation) {
      const occMsgs = OCCUPATION_MESSAGES[occupation]?.[timeOfDay];
      if (occMsgs?.length) return pickRandom(occMsgs);
    }
    return pickRandom(d.time[timeOfDay]);
  }
  if (roll < 0.85) return pickRandom(d.emotion[emotion]);
  return pickRandom(d.affection);
}

export function getActionMessage(
  action: "feed" | "play" | "sleep",
  characterType?: CharacterType
): string {
  return pickRandom(getDialogue(characterType).actionReaction[action]);
}

const USER_CHAT_RESPONSES: Record<CharacterType, Record<string, string[]>> = {
  orangutan: {
    greeting: ["안녕~! 우끼끼! 오늘도 반가워!", "헤헤~ 나 보고 싶었어?", "왔구나! 심심했어~"],
    love: ["나도 좋아해! 우끼~ ❤", "헤헤... 부끄러워... 바나나 색으로 물든다", "고마워! 나도 너 좋아!"],
    howAreYou: ["나? 완전 좋아! 너만 오면 기분 최고야!", "바나나 먹으면 더 좋을 것 같아~", "좋아좋아! 너는 어때?"],
    bored: ["심심해? 나랑 놀자! 나무타기 할래?", "그럼 같이 뒹굴자~ 우끼끼!", "심심하면 간식 먹자! 그게 최고야"],
    tired: ["힘들면 좀 쉬어! 내가 옆에 있어줄게", "무리하지 마~ 바나나 먹고 힘내!", "피곤하구나... 같이 낮잠 잘까?"],
    funny: ["ㅋㅋㅋ 뭐야 웃겨! 우끼끼끼!", "하하하! 또 해줘 또!", "넌 진짜 재밌어! 최고야!"],
    food: ["밥! 밥! 바나나! 우끼끼!", "맛있는 거 먹고 싶다~! 뭐 먹어?", "배고프지? 나도! 같이 먹자!"],
    default: ["우끼? 그렇구나~!", "오호~ 재밌다!", "헤헤~ 그래그래!", "우끼끼! 알겠어!", "그런 거야? 신기하다~!"],
  },
  cat: {
    greeting: ["... 왔어? 크흠. 기다린 건 아니야", "어... 안녕. 늦었잖아", "흥, 이제야 왔네"],
    love: ["... 뭐야 갑자기. 싫지는 않아", "크흠... 나도... 뭐... 싫진 않다고", "그런 말 하지 마. 동요되잖아"],
    howAreYou: ["보면 몰라? 완벽하지. 항상", "근육 컨디션 최고야. 크흠", "나는 항상 좋아. 고양이니까"],
    bored: ["심심해? 내 근육 구경하면 안 심심할 텐데", "... 나도 좀 심심하긴 해. 인정 안 할 거지만", "놀아줄까... 가 아니라, 같이 있어주는 거야"],
    tired: ["무리하지 마. 참치 먹고 자. 내가 처방이야", "피곤하면 자. 고양이처럼 하루 16시간", "... 옆에서 지켜볼 테니까 좀 쉬어"],
    funny: ["... 크흠. 안 웃겨. (입꼬리 올라감)", "웃긴 건 인정. 크크크... 아니 안 웃었어", "... 한 번만 더 해봐"],
    food: ["참치. 참치가 답이야. 항상", "밥이라... 나는 참치 아니면 안 먹어", "배고파? 나한테 참치 안 줄 거면 관심 없어"],
    default: ["크흠... 그래", "... 알겠어. 뭐", "흥, 그런 거야?", "... 흥. 관심 없지만 들어는 줬어", "그래. 뭐. 나쁘지 않아"],
  },
  penguin: {
    greeting: ["안녕안녕~!! 보고 싶었어~!", "왔다~! 오늘도 같이 놀자!", "반가워! 뒤뚱뒤뚱~ 달려왔어!"],
    love: ["나도 좋아해~! 진짜진짜! ❤", "헤헤~ 그 말 들으면 남극만큼 시원해져!", "좋아좋아~! 펭귄 춤 출 거야!"],
    howAreYou: ["좋아~! 특히 지금! 너랑 있으니까!", "남극보다 여기가 좋아! 너 있으니까~", "기분 좋아! 수영하고 싶은 기분!"],
    bored: ["심심해? 같이 뒤뚱뒤뚱 걸을까?", "나랑 눈싸움하자~! 아 여긴 눈이 없구나", "심심하면 재밌는 얘기 해줄까?"],
    tired: ["힘내! 펭귄도 먼 길 걸어서 힘들 때 있어!", "쉬어~ 내가 옆에서 노래 불러줄게~", "피곤하면 같이 눈 위에 누워서 쉬자~"],
    funny: ["ㅋㅋㅋ 웃겨! 뒤뚱뒤뚱 웃음!", "하하하~! 배 잡고 굴러갈 것 같아!", "재밌다~! 또 해줘~!"],
    food: ["생선! 생선 먹고 싶어~!", "밥 시간?! 최고다!", "배고파~ 같이 맛있는 거 먹자!"],
    default: ["오~ 그렇구나~!", "우와~ 신기해!", "그렇구나! 알려줘서 고마워~", "재밌다~!", "오호~! 그런 거야?"],
  },
  hamster: {
    greeting: ["짹짹! 왔어?! 보고 싶었어!!!", "안녕안녕!! 짹짹짹!", "왔다!! 빨리 와!! 짹짹!"],
    love: ["짹짹~! 나도!! 나도 좋아해!! 볼 빵빵!", "헤헤헤~ 볼에 넣어두고 싶어 그 마음!", "좋아좋아! 쳇바퀴 100바퀴 돌 수 있어!"],
    howAreYou: ["좋아! 해바라기씨 먹었으니까! 짹!", "기분 좋아~! 쳇바퀴 돌고 싶은 기분!", "최고야! 너 왔으니까! 짹짹!"],
    bored: ["심심해?! 같이 쳇바퀴 돌자!! 짹짹!", "나도 심심해! 숨바꼭질 할래?!", "간식 먹으면 안 심심해! 진짜야!"],
    tired: ["힘들어? 볼에 넣어서 데려다줄까?", "쉬어~ 내 볼 위에 기대도 돼! 푹신해!", "피곤하면 해바라기씨 먹으면 돼! 만병통치약!"],
    funny: ["ㅋㅋㅋ 뭐야!! 웃겨! 짹짹짹!", "하하하!! 볼이 빵빵해질 정도로 웃겨!", "또또또! 또 해줘!! 짹짹!"],
    food: ["간식!! 간식!!! 해바라기씨!!! 짹짹!!!", "밥?! 어디?! 짹짹짹!!!", "배고파~! 볼에 잔뜩 넣을 거야!"],
    default: ["짹? 그런 거야?!", "우와~! 대박! 짹짹!", "오호~! 재밌어! 짹!", "그렇구나~! 짹짹!", "알겠어! 짹! 짹!"],
  },
};

const KEYWORD_MAP: [string[], string][] = [
  [["안녕", "하이", "hi", "hello", "ㅎㅇ"], "greeting"],
  [["좋아", "사랑", "love", "❤", "이뻐", "귀여", "최고"], "love"],
  [["어때", "기분", "컨디션", "잘 지내", "뭐해"], "howAreYou"],
  [["심심", "지루", "할 게 없", "놀자"], "bored"],
  [["힘들", "피곤", "지치", "졸려", "아파"], "tired"],
  [["ㅋㅋ", "ㅎㅎ", "웃겨", "재밌", "ㅋ", "하하"], "funny"],
  [["밥", "배고", "먹", "간식", "치킨", "피자", "라면"], "food"],
];

export function getChatResponse(userMsg: string, characterType: CharacterType = "orangutan"): string {
  const lower = userMsg.toLowerCase();
  const responses = USER_CHAT_RESPONSES[characterType];

  for (const [keywords, category] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return pickRandom(responses[category]);
    }
  }
  return pickRandom(responses.default);
}
